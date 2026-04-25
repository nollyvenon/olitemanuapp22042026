'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getApiClient } from '@/lib/api-client';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  status: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  items?: InvoiceItem[];
  order?: {
    creator?: {
      name: string;
      locations?: Array<{ name: string; city?: string }>;
    };
  };
  customer?: {
    name: string;
    company?: string;
  };
}

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const api = getApiClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/invoices/${id}?include=order,order.creator,order.creator.locations,customer`);
        setInvoice(data);
      } catch (error) {
        console.error('Failed to load invoice', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, api]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!invoice) return;
    setUpdating(true);
    try {
      const { data } = await api.patch(`/invoices/${id}/status`, { status: newStatus });
      setInvoice(data);
    } catch (error) {
      console.error('Status update failed', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!invoice) return <div className="p-6">Invoice not found</div>;

  const paidAmount = invoice.total - (invoice.items ? invoice.items.reduce((sum, item) => sum + (item.total_price || 0), 0) : 0);
  const balance = invoice.total - paidAmount;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-gray-600 mt-1">{invoice.customer_name}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Customer & Initiator Info */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Customer</p>
          <p className="text-sm font-medium mt-1">{invoice.customer?.name || invoice.customer_name}</p>
          {invoice.customer?.company && <p className="text-xs text-gray-500">{invoice.customer.company}</p>}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Initiator</p>
          <p className="text-sm font-medium mt-1">{invoice.order?.creator?.name || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Depot</p>
          <p className="text-sm font-medium mt-1">{invoice.order?.creator?.locations?.[0]?.name || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Territory</p>
          <p className="text-sm font-medium mt-1">{invoice.order?.creator?.locations?.[0]?.city || '-'}</p>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Invoice Date</p>
          <p className="text-sm font-medium mt-1">{fmtDate(invoice.invoice_date)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Due Date</p>
          <p className="text-sm font-medium mt-1">{fmtDate(invoice.due_date)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Status</p>
          <p className="text-sm font-medium mt-1">{invoice.status}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Balance Due</p>
          <p className={`text-sm font-bold mt-1 ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(balance)}</p>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card className="p-6">
        <h2 className="font-bold mb-4">Invoice Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-700">Description</th>
              <th className="text-right py-2 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-2 font-semibold text-gray-700">Unit Price</th>
              <th className="text-right py-2 font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3">{item.description}</td>
                  <td className="text-right py-3 tabular-nums">{item.quantity}</td>
                  <td className="text-right py-3 tabular-nums">{fmt(item.unit_price)}</td>
                  <td className="text-right py-3 tabular-nums font-semibold">{fmt(item.total_price)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500 text-xs">No items</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
          <div className="space-y-1 text-sm w-48">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium tabular-nums">{fmt(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax:</span><span className="font-medium tabular-nums">{fmt(invoice.tax)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-1"><span className="font-bold">Total:</span><span className="font-bold tabular-nums text-base">{fmt(invoice.total)}</span></div>
          </div>
        </div>
      </Card>

      {/* Payment Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Invoice Total</p>
          <p className="text-lg font-bold mt-1">{fmt(invoice.total)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Amount Paid</p>
          <p className="text-lg font-bold mt-1 text-green-600">{fmt(paidAmount)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Balance Due</p>
          <p className={`text-lg font-bold mt-1 ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(balance)}</p>
        </Card>
      </div>

      {/* Status Actions */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold mb-4">Invoice Status</h2>
        <div className="space-y-2">
          {invoice.status === 'draft' && (
            <Button
              onClick={() => handleStatusUpdate('sent')}
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updating ? 'Sending...' : 'Mark as Sent'}
            </Button>
          )}

          {invoice.status === 'sent' && (
            <Button
              onClick={() => handleStatusUpdate('paid')}
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {updating ? 'Marking...' : 'Mark as Paid'}
            </Button>
          )}

          {invoice.status === 'paid' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 font-medium">
              ✓ Invoice has been paid
            </div>
          )}

          {['overdue', 'cancelled'].includes(invoice.status) && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 font-medium">
              Invoice status: {invoice.status}
            </div>
          )}
        </div>
      </Card>

      {/* Print/Download */}
      <div className="flex gap-2">
        <Button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50">
          Print Invoice
        </Button>
        <Button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50">
          Download PDF
        </Button>
      </div>
    </div>
  );
}
