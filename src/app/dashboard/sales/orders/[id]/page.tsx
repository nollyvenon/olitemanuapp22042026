'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';
import { ArrowRight, Upload, AlertCircle, CheckCircle } from 'lucide-react';

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

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [fileError, setFileError] = useState('');

  const api = getApiClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to load order', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, api]);

  const handleTransition = async (newStatus: string) => {
    if (!order) return;
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/orders/${id}/transition`, { status: newStatus });
      setOrder(data);
    } catch (error) {
      console.error('Transition failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocuments = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFileError('');

    const formData = new FormData(e.currentTarget);
    const tallyFile = formData.get('tally_invoice') as File;
    const deliveryFile = formData.get('delivery_note') as File;

    if (!tallyFile || !deliveryFile) {
      setFileError('Both files are required');
      return;
    }

    setSubmitting(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('tally_invoice', tallyFile);
      uploadFormData.append('delivery_note', deliveryFile);

      const { data } = await api.post(`/orders/${id}/documents`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOrder(data);
      setShowUpload(false);
    } catch (error) {
      console.error('Upload failed', error);
      setFileError('Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthorize = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/orders/${id}/authorize`);
      setOrder(data);
    } catch (error) {
      console.error('Authorization failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverride = async () => {
    if (!order || !overrideReason.trim()) return;
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="space-y-6 p-6">
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

      {/* State Flow */}
      <StateFlow current={order.status} />

      {/* Order Details Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Order Date</p>
          <p className="text-sm font-medium mt-1">{new Date(order.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-700">Product</th>
              <th className="text-right py-2 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-2 font-semibold text-gray-700">Unit Price</th>
              <th className="text-right py-2 font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3">{item.product_name}</td>
                <td className="text-right py-3 tabular-nums">{item.quantity}</td>
                <td className="text-right py-3 tabular-nums">{fmt(item.unit_price)}</td>
                <td className="text-right py-3 tabular-nums font-semibold">{fmt(item.total_price)}</td>
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
        <PermissionGuard permission="sales.orders.approve">
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
          {order.status === 'APPROVED' && !order.tally_invoice_path && !order.delivery_note_path && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Upload Tally Invoice and Delivery Note to proceed with authorization</span>
              </div>
              <Button
                onClick={() => setShowUpload(!showUpload)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {showUpload ? 'Cancel' : 'Upload Documents'}
              </Button>

              {showUpload && (
                <form onSubmit={handleUploadDocuments} className="space-y-3 p-4 bg-gray-50 rounded border border-gray-200">
                  {fileError && <p className="text-xs text-red-600">{fileError}</p>}
                  <div>
                    <label className="text-xs font-medium block mb-1">Tally Invoice</label>
                    <input type="file" name="tally_invoice" accept=".pdf,.jpg,.jpeg,.png" required className="w-full text-xs border border-gray-300 rounded p-2" />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Delivery Note</label>
                    <input type="file" name="delivery_note" accept=".pdf,.jpg,.jpeg,.png" required className="w-full text-xs border border-gray-300 rounded p-2" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    {submitting ? 'Uploading...' : 'Upload'}
                  </Button>
                </form>
              )}
            </div>
          )}

          {order.status === 'APPROVED' && order.tally_invoice_path && order.delivery_note_path && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Documents uploaded. Ready for authorization.</span>
              </div>
              <Button
                onClick={handleAuthorize}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? 'Authorizing...' : 'Authorize Order'}
              </Button>
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
        <Card className="p-6 space-y-4 bg-green-50 border border-green-200">
          <h2 className="font-bold">Invoice</h2>
          {order.invoice ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Invoice Created</p>
                <p className="font-semibold mt-1">INV-{order.invoice.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <Button
                onClick={() => router.push(`/sales/invoices/${order.invoice!.id}`)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                View Invoice
              </Button>
            </div>
          ) : (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Generate Invoice
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
