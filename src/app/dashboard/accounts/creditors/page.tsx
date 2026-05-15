'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Select from 'react-select';
import { getApiClient } from '@/lib/api-client';
import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Creditor {
  id: string;
  account_code: string;
  name: string;
  contact: string;
  payable: number;
  overdue: number;
  next_due: string;
  status: string;
  location?: { id: string; name: string };
  territory?: { id: string; name: string };
  salesOfficer?: { id: string; name: string };
}

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

const columns: ColumnDef<Creditor>[] = [
  { accessorKey: 'account_code', header: 'Account #',  cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',         header: 'Supplier',   cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'contact',      header: 'Contact',    cell: i => <span className="text-xs" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  { accessorKey: 'payable',      header: 'Payable',    cell: i => <span className="font-bold tabular-nums" style={{ color: '#cc0c39' }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'overdue',      header: 'Overdue',    cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : '#767676' }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'next_due',     header: 'Next Due',   cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'status',       header: 'Status',     cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function CreditorsPage() {
  const api = getApiClient();
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'overdue', desc: true }]);
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'creditor', customer_id: '', location_id: '', territory_id: '', sales_officer_id: '', price_category_id: '', credit_limit: 0, opening_balance: 0 });
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [priceCategories, setPriceCategories] = useState<{ id: string; name: string }[]>([]);
  const [territories, setTerritories] = useState<{ id: string; name: string }[]>([]);
  const [salesOfficers, setSalesOfficers] = useState<{ id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data }, { data: locationsData }, { data: priceCategoriesData }, { data: territoriesData }, { data: usersData }, { data: customersData }] = await Promise.all([
          api.get('/accounts/creditors'),
          api.get('/locations'),
          api.get('/price-categories'),
          api.get('/territories'),
          api.get('/users'),
          api.get('/customers'),
        ]);
        const list = Array.isArray(data) ? data : data.data ?? [];
        setCreditors(list);
        setLocations(locationsData.data || []);
        setPriceCategories(priceCategoriesData.data || []);
        setTerritories(territoriesData.data || []);
        setSalesOfficers(usersData.data || []);
        setCustomers(customersData.data || []);
      } catch (err) {
        console.error('Failed to load creditors', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const handleAddLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/ledgers', {
        name: form.name,
        type: 'creditor',
        customer_id: form.customer_id || null,
        location_id: form.location_id,
        territory_id: form.territory_id || null,
        sales_officer_id: form.sales_officer_id || null,
        price_category_id: form.price_category_id || null,
        credit_limit: form.credit_limit,
        opening_balance: form.opening_balance,
      });
      const { data } = await api.get('/accounts/creditors');
      const list = Array.isArray(data) ? data : data.data ?? [];
      setCreditors(list);
      setOpenAdd(false);
      setForm({ name: '', type: 'creditor', customer_id: '', location_id: '', territory_id: '', sales_officer_id: '', price_category_id: '', credit_limit: 0, opening_balance: 0 });
    } catch (err: any) {
      alert('❌ Failed to create ledger: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to create ledger', err);
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Account #', 'Supplier', 'Contact', 'Payable', 'Overdue', 'Next Due', 'Status'];
    const rows = creditors.map(c => [c.account_code, c.name, c.contact, c.payable, c.overdue, c.next_due, c.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creditors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Creditors" description="Creditor ledgers: purchase invoices credit, supplier payments debit." />
        <Button onClick={() => setOpenAdd(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
          + Add Ledger
        </Button>
        {creditors.length > 0 && <Button onClick={exportCSV} variant="outline" className="text-xs">📥 Export CSV</Button>}
      </div>
      <DataTable columns={columns} data={creditors} sorting={sorting} onSortingChange={setSorting} />
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Creditor Ledger</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLedger} className="space-y-4">
            <div>
              <Label>Ledger Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>Customer (optional)</Label>
              <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="w-full p-2 border rounded" disabled={submitting}>
                <option value="">Select Customer</option>
                {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Store Location *</Label>
              <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
                <option value="">Select Location</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Account Domicile Territory (optional)</Label>
              <select value={form.territory_id} onChange={(e) => setForm({ ...form, territory_id: e.target.value })} className="w-full p-2 border rounded" disabled={submitting}>
                <option value="">Select Territory</option>
                {territories.map(terr => <option key={terr.id} value={terr.id}>{terr.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Sales Officer (optional)</Label>
              <select value={form.sales_officer_id} onChange={(e) => setForm({ ...form, sales_officer_id: e.target.value })} className="w-full p-2 border rounded" disabled={submitting}>
                <option value="">Select Sales Officer</option>
                {salesOfficers.map(officer => <option key={officer.id} value={officer.id}>{officer.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Price Category (optional)</Label>
              <select value={form.price_category_id} onChange={(e) => setForm({ ...form, price_category_id: e.target.value })} className="w-full p-2 border rounded" disabled={submitting}>
                <option value="">Select Price Category</option>
                {priceCategories.map(pc => <option key={pc.id} value={pc.id}>{pc.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Credit Limit</Label>
              <Input type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: parseFloat(e.target.value) })} disabled={submitting} />
            </div>
            <div>
              <Label>Opening Balance</Label>
              <Input type="number" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: parseFloat(e.target.value) })} disabled={submitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
