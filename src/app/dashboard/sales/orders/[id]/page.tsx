'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { usePermission } from '@/hooks/usePermission';
import { ArrowRight, Upload, AlertCircle, CheckCircle, Trash2, Printer } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  form_status: string;
  order_date: string;
  subtotal: number;
  tax: number;
  total: number;
  items: OrderItem[];
  tally_invoice_path?: string;
  delivery_note_path?: string;
  invoice?: { id: string };
  metadata?: Record<string, any>;
  created_by_id?: string;
  approved_sales_order_id?: string;
  creator?: {
    id?: string;
    name: string;
    groups?: { id: string; name?: string }[];
    locations?: Array<{ id?: string; name: string; city?: string }>;
  };
  customer?: {
    name: string;
    company?: string;
  };
}

const StateFlow = ({ current }: { current: string }) => {
  const states = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PENDING_AUTH', 'AUTHORIZED'];
  const currentIndex = states.indexOf(current);

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto py-2">
      {states.map((state, idx) => (
        <div key={state} className="flex items-center gap-2 min-w-max">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            idx < currentIndex ? 'bg-green-100 text-green-700' :
            idx === currentIndex ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {state}
          </div>
          {idx < states.length - 1 && (
            <ArrowRight className={`h-4 w-4 ${idx < currentIndex ? 'text-green-600' : 'text-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

function assetUrl(p?: string) {
  if (!p) return '#';
  if (p.startsWith('http')) return p;
  const b = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  return `${b}${p.startsWith('/') ? p : `/${p}`}`;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [fileError, setFileError] = useState('');
  const [depotOk, setDepotOk] = useState(false);
  const [authParamsOk, setAuthParamsOk] = useState(false);
  const [tradeLoc, setTradeLoc] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [editingReview, setEditingReview] = useState(false);
  const [reviewDraft, setReviewDraft] = useState<{ id: string; product_name: string; quantity: number; unit_price: number }[]>([]);
  const delFileRef = useRef<HTMLInputElement>(null);
  const invFileRef = useRef<HTMLInputElement>(null);

  const api = getApiClient();
  const user = useAuthStore((s) => s.user);
  const { canAny } = usePermission();
  const canApprove = canAny(['sales.orders.approve', 'admin.*']);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}?include=creator,creator.locations,creator.groups,customer`);
        const d = data as Record<string, unknown>;
        const cr = (d.creator as Order['creator']) || {};
        const created_by_id = String(d.created_by_id ?? d.user_id ?? d.creator_id ?? (cr && typeof cr === 'object' && 'id' in cr ? (cr as { id?: string }).id : '') ?? '');
        setOrder({
          ...(d as object),
          created_by_id: created_by_id || undefined,
          approved_sales_order_id: (d.approved_sales_order_id as string) || (d.metadata as { approved_sales_order_id?: string } | undefined)?.approved_sales_order_id,
          items: (d.items as OrderItem[]) || [],
        } as Order);
      } catch (error) {
        console.error('Failed to load order', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, api]);

  useEffect(() => {
    if (!order || order.status !== 'APPROVED') return;
    const first = String(order.creator?.locations?.[0]?.id ?? user?.locations?.[0]?.id ?? '');
    setTradeLoc((t) => t || first);
  }, [order?.id, order?.status, order?.creator?.locations, user?.locations]);

  useEffect(() => {
    setDepotOk(false);
    setAuthParamsOk(false);
  }, [order?.delivery_note_path, order?.tally_invoice_path, order?.id]);

  const handleTransition = async (newStatus: string) => {
    if (!order) return;
    if (newStatus === 'SUBMITTED' && !confirm('Reviewed everything? OK=YES submit, Cancel=NO to edit.')) return;
    if (newStatus === 'APPROVED' && !confirm('Reviewed everything? OK=YES approve, Cancel=NO to edit.')) return;
    if (newStatus === 'REJECTED' && !confirm('Reject this order? OK=YES, Cancel=NO.')) return;
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/orders/${id}/transition`, { status: newStatus });
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              created_by_id: prev.created_by_id || (data as { created_by_id?: string }).created_by_id,
              items: (data as { items?: OrderItem[] }).items || prev.items,
            }
          : null
      );
    } catch (error) {
      console.error('Transition failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSingle = async (kind: 'tally_invoice' | 'delivery_note', file: File | undefined) => {
    if (!order || !file) return;
    setFileError('');
    if (!confirm('Upload this file? OK=YES, Cancel=NO.')) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append(kind, file);
      const { data } = await api.post(`/orders/${id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...(data as object),
              created_by_id: prev.created_by_id || (data as { created_by_id?: string }).created_by_id,
              items: (data as { items?: OrderItem[] }).items || prev.items,
            }
          : null
      );
    } catch {
      setFileError('Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthorize = async () => {
    if (!order) return;
    if (!depotOk || !authParamsOk) {
      setAuthErr('Confirm store location and trading parameters');
      return;
    }
    if ((user?.locations?.length ?? 0) > 0 && !tradeLoc) {
      setAuthErr('Select store location');
      return;
    }
    if (!confirm('Authorization locks corrections after verify. OK=YES authorize, Cancel=NO to adjust.')) return;
    setAuthErr('');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/orders/${id}/authorize`, tradeLoc ? { location_id: tradeLoc } : {});
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...(data as object),
              created_by_id: prev.created_by_id || (data as { created_by_id?: string }).created_by_id,
              items: (data as { items?: OrderItem[] }).items || prev.items,
            }
          : null
      );
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string; error?: string } } };
      const m = String(e.response?.data?.message || e.response?.data?.error || '');
      const low = /stock|balance|insufficient|below|trading|available|qty|quantity/i.test(m);
      setAuthErr(low ? 'Low Stock Balance Override needed' : m || 'Authorization failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverride = async () => {
    if (!order || !overrideReason.trim()) return;
    if (!confirm('Submit override?')) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/orders/${id}/override`, { override_reason: overrideReason });
      setOrder(data);
      setShowOverride(false);
      setOverrideReason('');
    } catch (error) {
      console.error('Override failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;
    if (!confirm('Generate invoice?')) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/orders/${id}/invoices`);
      setOrder(data);
    } catch (error) {
      console.error('Invoice generation failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const startReviewEdit = () => {
    if (!order?.items?.length) return;
    setReviewDraft(
      order.items.map((i) => ({
        id: i.id,
        product_name: i.product_name,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
      }))
    );
    setEditingReview(true);
  };

  const saveReviewLines = async () => {
    if (!order || order.status !== 'UNDER_REVIEW' || !reviewDraft.length) return;
    if (!confirm('Reviewed all line changes? OK=YES save, Cancel=NO to edit.')) return;
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/orders/${id}`, {
        items: reviewDraft.map((r) => ({
          id: r.id,
          quantity: r.quantity,
          unit_price: r.unit_price,
        })),
      });
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              created_by_id: prev.created_by_id || (data as { created_by_id?: string }).created_by_id,
              items: data.items || [],
            }
          : null
      );
      setEditingReview(false);
    } catch (error) {
      console.error('Save lines failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const creatorId = order.created_by_id || order.creator?.id;
  const isCreator = !!(user?.id && creatorId && user.id === creatorId);
  const cg = order.creator?.groups?.map((g) => g.id) ?? [];
  const isLinePeer =
    !!user &&
    !isCreator &&
    cg.length > 0 &&
    user.groups?.some((g) => cg.includes(g.id));
  const viewOnlyBanner =
    ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(order.status) &&
    !canApprove &&
    (isCreator || isLinePeer) &&
    canAny(['sales.orders.read', 'audit.read']);

  const apid = order.approved_sales_order_id || (order.metadata as { approved_sales_order_id?: string } | undefined)?.approved_sales_order_id;

  return (
    <div className="space-y-6 p-6">
      {viewOnlyBanner && (
        <Card className="p-3 border-amber-200 bg-amber-50 text-sm text-amber-900">View only: submitter and same-group line manager cannot alter this order while it is under review or approved.</Card>
      )}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.order_number}</h1>
          <p className="text-gray-600 mt-1">{order.customer_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.form_status} />
        </div>
      </div>

        <PermissionGuard permissions={['sales.orders.read', 'audit.read', 'admin.*']}>
          {apid && (
            <Card className="p-4 mb-4 border-green-200 bg-green-50">
              <p className="text-xs font-semibold text-green-900">Approved sales order</p>
              <p className="text-sm font-mono mt-1">{String(apid)}</p>
            </Card>
          )}
        </PermissionGuard>

      <StateFlow current={order.status} />

      {/* Customer & Initiator Info */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Customer</p>
          <p className="text-sm font-medium mt-1">{order.customer?.name || order.customer_name}</p>
          {order.customer?.company && <p className="text-xs text-gray-500">{order.customer.company}</p>}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Initiator</p>
          <p className="text-sm font-medium mt-1">{order.creator?.name || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Depot</p>
          <p className="text-sm font-medium mt-1">{order.creator?.locations?.[0]?.name || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Territory</p>
          <p className="text-sm font-medium mt-1">{order.creator?.locations?.[0]?.city || '-'}</p>
        </Card>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Order Date</p>
          <p className="text-sm font-medium mt-1">{new Date(order.order_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Form Status</p>
          <p className="text-sm font-medium mt-1">{order.form_status === 'manual_captured' ? 'Manual Form Captured' : 'No Manual Form'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Current Status</p>
          <p className="text-sm font-medium mt-1">{order.status}</p>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="p-6">
        <h2 className="font-bold mb-4">Order Items</h2>
        <PermissionGuard permissions={['sales.orders.approve', 'admin.*']}>
          {order.status === 'UNDER_REVIEW' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {!editingReview ? (
                <Button type="button" variant="outline" onClick={startReviewEdit} disabled={submitting}>
                  Adjust lines
                </Button>
              ) : (
                <>
                  <Button type="button" onClick={saveReviewLines} disabled={submitting} className="bg-amber-600 text-white">
                    Save lines
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingReview(false)} disabled={submitting}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </PermissionGuard>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-700">Product</th>
              <th className="text-right py-2 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-2 font-semibold text-gray-700">Unit Price</th>
              <th className="text-right py-2 font-semibold text-gray-700">Total</th>
              {order.status === 'UNDER_REVIEW' && editingReview && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {(order.status === 'UNDER_REVIEW' && editingReview ? reviewDraft : order.items || []).map((item, idx) => (
              <tr key={item.id || idx} className="border-b border-gray-100">
                <td className="py-3">{item.product_name}</td>
                <td className="text-right py-3 tabular-nums">
                  {order.status === 'UNDER_REVIEW' && editingReview ? (
                    <Input
                      type="number"
                      min={1}
                      className="w-20 ml-auto text-right"
                      value={item.quantity}
                      onChange={(e) => {
                        const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setReviewDraft((d) => d.map((row) => (row.id === item.id ? { ...row, quantity: q } : row)));
                      }}
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="text-right py-3 tabular-nums">{fmt(item.unit_price)}</td>
                <td className="text-right py-3 tabular-nums font-semibold">{fmt(item.quantity * item.unit_price)}</td>
                {order.status === 'UNDER_REVIEW' && editingReview && (
                  <td className="py-3 w-10">
                    <button
                      type="button"
                      className="p-1 text-red-600"
                      onClick={() => setReviewDraft((d) => d.filter((row) => row.id !== item.id))}
                      disabled={reviewDraft.length < 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
          <div className="space-y-1 text-sm w-48">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium tabular-nums">{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax (7.5%):</span><span className="font-medium tabular-nums">{fmt(order.tax)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-1"><span className="font-bold">Total:</span><span className="font-bold tabular-nums text-base">{fmt(order.total)}</span></div>
          </div>
        </div>
      </Card>

      {/* Actions Panel */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold mb-4">Actions</h2>

        {/* Sales Officer: Submit for Review */}
        <PermissionGuard permission="sales.orders.create">
          {order.status === 'DRAFT' && (
            <Button
              onClick={() => handleTransition('SUBMITTED')}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </PermissionGuard>

        {/* Sales Admin: Approve / Reject */}
        <PermissionGuard permissions={['sales.orders.approve', 'admin.*']}>
          {order.status === 'UNDER_REVIEW' && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleTransition('APPROVED')}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                onClick={() => handleTransition('REJECTED')}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          )}
        </PermissionGuard>

        {/* Accounts: Document Upload and Authorization */}
        <PermissionGuard permission="accounts.*">
          {order.status === 'APPROVED' && (
            <div className="space-y-3">
              {apid && (
                <Card className="p-4 border-green-200 bg-green-50">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-green-900">Approved sales order — Tally trading</p>
                      <p className="text-sm font-mono mt-1">{String(apid)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        const w = window.open('', 'aso');
                        if (!w || !order) return;
                        const lines = order.items.map((i) => `${i.product_name}\t${i.quantity}\t${i.unit_price}`).join('\n');
                        w.document.write(`<pre>${order.order_number}\n${String(apid)}\n${lines}\n${order.total}</pre>`);
                        w.print();
                        w.close();
                      }}
                    >
                      <Printer className="h-4 w-4 mr-1 inline" />
                      Print
                    </Button>
                  </div>
                </Card>
              )}
              {(!order.delivery_note_path || !order.tally_invoice_path) && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Upload Tally delivery note and Tally invoice separately; authorize unlocks only after both are present.</span>
                  </div>
                  {fileError && <p className="text-xs text-red-600">{fileError}</p>}
                  <input ref={delFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; void handleUploadSingle('delivery_note', f); e.target.value = ''; }} />
                  <input ref={invFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; void handleUploadSingle('tally_invoice', f); e.target.value = ''; }} />
                  {!order.delivery_note_path && (
                    <Button type="button" disabled={submitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={() => delFileRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Tally delivery note
                    </Button>
                  )}
                  {order.delivery_note_path && !order.tally_invoice_path && <p className="text-xs text-green-700">Delivery note uploaded</p>}
                  {!order.tally_invoice_path && (
                    <Button type="button" disabled={submitting} className="w-full bg-slate-700 text-white" onClick={() => invFileRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Tally invoice
                    </Button>
                  )}
                  {order.tally_invoice_path && !order.delivery_note_path && <p className="text-xs text-green-700">Invoice uploaded</p>}
                </div>
              )}
              {order.tally_invoice_path && order.delivery_note_path && (
                <div className="space-y-3">
                  {authErr && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">{authErr}</p>}
                  {(user?.locations?.length ?? 0) > 0 && (
                    <div>
                      <label className="text-xs font-medium block mb-1">Store location</label>
                      <select value={tradeLoc} onChange={(e) => setTradeLoc(e.target.value)} className="w-full text-sm border rounded p-2 bg-white">
                        <option value="">Select…</option>
                        {user!.locations!.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={depotOk} onChange={(e) => setDepotOk(e.target.checked)} className="accent-amber-500" />
                    Store location and parameters verified
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={authParamsOk} onChange={(e) => setAuthParamsOk(e.target.checked)} className="accent-amber-500" />
                    Trading parameters checked (correct before submit — locks after authorize)
                  </label>
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Both documents uploaded. Complete checks to authorize.</span>
                  </div>
                  <Button
                    onClick={handleAuthorize}
                    disabled={submitting || !depotOk || !authParamsOk || ((user?.locations?.length ?? 0) > 0 && !tradeLoc)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submitting ? 'Authorizing...' : 'Authorize Order'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </PermissionGuard>

        {/* Override Panel */}
        <PermissionGuard permission="sales.orders.override">
          {['APPROVED', 'UNDER_REVIEW', 'SUBMITTED'].includes(order.status) && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowOverride(!showOverride)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {showOverride ? 'Cancel Override' : 'Override Order'}
              </Button>

              {showOverride && (
                <div className="space-y-2 p-4 bg-orange-50 rounded border border-orange-200">
                  <label className="text-xs font-medium block">Reason (max 500 chars)</label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value.slice(0, 500))}
                    maxLength={500}
                    placeholder="Explain the reason for override..."
                    className="w-full text-sm border border-orange-300 rounded p-2 h-20"
                  />
                  <div className="text-xs text-gray-600">{overrideReason.length}/500</div>
                  <Button
                    onClick={handleOverride}
                    disabled={submitting || !overrideReason.trim()}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {submitting ? 'Overriding...' : 'Confirm Override'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </PermissionGuard>
      </Card>

      {/* Invoice Section */}
      {order.status === 'AUTHORIZED' && (
        <PermissionGuard permissions={['accounts.*', 'sales.orders.approve', 'sales.orders.read', 'sales.orders.create', 'audit.read', 'admin.*']}>
          <Card id="auth-invoice-card" className="p-6 space-y-4 bg-green-50 border border-green-200">
            <h2 className="font-bold">Invoice & Tally documents</h2>
            {order.invoice ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Sales invoice</p>
                    <p className="font-semibold mt-1">INV-{order.invoice.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => router.push(`/dashboard/sales/invoices/${order.invoice!.id}`)} className="bg-green-600 hover:bg-green-700 text-white">
                      View / download
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                      <Printer className="h-4 w-4 mr-1 inline" />
                      Print
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {order.tally_invoice_path ? (
                    <a href={assetUrl(order.tally_invoice_path)} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Tally invoice file
                    </a>
                  ) : null}
                  {order.delivery_note_path ? (
                    <a href={assetUrl(order.delivery_note_path)} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Tally delivery note file
                    </a>
                  ) : null}
                </div>
              </>
            ) : (
              <Button onClick={handleGenerateInvoice} disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {submitting ? 'Generating...' : 'Generate Invoice'}
              </Button>
            )}
          </Card>
        </PermissionGuard>
      )}
    </div>
  );
}
