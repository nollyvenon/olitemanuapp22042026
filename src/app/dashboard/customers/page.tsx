'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';
import { Trash2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: string;
  created_at?: string;
}

const columns: ColumnDef<Customer>[] = [
  { accessorKey: 'name', header: 'Name', cell: i => <span className="font-medium">{String(i.getValue())}</span> },
  { accessorKey: 'company', header: 'Company', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'email', header: 'Email', cell: i => <span className="text-sm">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'phone', header: 'Phone', cell: i => <span className="text-sm">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'type', header: 'Type', cell: i => <span className="text-xs px-2 py-1 bg-gray-100 rounded">{String(i.getValue() || 'general')}</span> },
];

export default function CustomersPage() {
  const api = getApiClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', address: '', type: 'individual' });

  const exportData = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Address', 'Type'];
    const rows = customers.map(c => [
      c.name,
      c.company || '-',
      c.email || '-',
      c.phone || '-',
      c.address || '-',
      c.type || 'individual'
    ]);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/customers');
        const customersList = Array.isArray(data) ? data : data.data ?? [];
        setCustomers(customersList);
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/customers', {
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        type: form.type,
      });
      const { data } = await api.get('/customers');
      const customersList = Array.isArray(data) ? data : data.data ?? [];
      setCustomers(customersList);
      setOpenAdd(false);
      setForm({ name: '', company: '', email: '', phone: '', address: '', type: 'individual' });
    } catch (err: any) {
      alert('❌ Failed to create customer: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to create customer', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);
    try {
      await api.patch(`/customers/${selectedCustomer.id}`, {
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        type: form.type,
      });
      const { data } = await api.get('/customers');
      const customersList = Array.isArray(data) ? data : data.data ?? [];
      setCustomers(customersList);
      setOpenEdit(false);
      setSelectedCustomer(null);
      setForm({ name: '', company: '', email: '', phone: '', address: '', type: 'individual' });
    } catch (err: any) {
      alert('❌ Failed to update customer: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to update customer', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/customers/${id}`);
      const { data } = await api.get('/customers');
      const customersList = Array.isArray(data) ? data : data.data ?? [];
      setCustomers(customersList);
    } catch (err) {
      console.error('Failed to delete customer', err);
    }
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/excel', {
        headers,
        rows,
        filename: `customers-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed', error);
      alert('Failed to export Excel file');
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/pdf', {
        headers,
        rows,
        title: 'Customers Report',
        filename: `customers-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed', error);
      alert('Failed to export PDF file');
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setForm({
      name: customer.name,
      company: customer.company || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      type: customer.type || 'individual',
    });
    setOpenEdit(true);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Customers"
          description="Manage customer accounts and information"
        />
        <div className="flex gap-2">
          <PermissionGuard permission="sales.customers.export">
            {customers.length > 0 && (
              <div className="flex gap-1">
                <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
              </div>
            )}
          </PermissionGuard>
          <PermissionGuard permission="sales.customers.create">
            <Button onClick={() => setOpenAdd(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
              + Add Customer
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="flex gap-2">
        {customers.map((customer) => (
          <div key={customer.id} className="p-4 border rounded-lg flex-1 max-w-xs">
            <h3 className="font-semibold">{customer.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{customer.company}</p>
            <p className="text-xs text-gray-500 mt-2">{customer.email}</p>
            <div className="flex gap-2 mt-3">
              <Button onClick={() => openEditDialog(customer)} size="sm" variant="outline">
                Edit
              </Button>
              <Button onClick={() => handleDelete(customer.id)} size="sm" variant="ghost">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Type</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded" disabled={submitting}>
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Type</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded" disabled={submitting}>
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
