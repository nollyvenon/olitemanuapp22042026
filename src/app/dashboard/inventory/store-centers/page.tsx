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

interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
}

const columns: ColumnDef<Location>[] = [
  { accessorKey: 'name', header: 'Name', cell: i => <span className="font-medium text-sm">{String(i.getValue())}</span> },
  { accessorKey: 'city', header: 'City', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'state', header: 'State', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
];

export default function StoreCentersPage() {
  const api = getApiClient();
  const [locations, setLocations] = useState<Location[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', state: '', country: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/locations');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setLocations(list);
      } catch (err) {
        console.error('Failed to load locations', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/locations', form);
      setOpen(false);
      setForm({ name: '', city: '', state: '', country: '' });
      const { data } = await api.get('/locations');
      const list = Array.isArray(data) ? data : data.data ?? [];
      setLocations(list);
    } catch (err) {
      console.error('Failed to create location', err);
    } finally {
      setSubmitting(false);
    }
  };

  const exportData = () => {
    const headers = ['Name', 'City', 'State', 'Country'];
    const rows = locations.map(l => [l.name, l.city || '-', l.state || '-', l.country || '-']);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `store-centers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const { data } = await api.post('/export/excel', {
        headers,
        rows,
        filename: `store-centers-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `store-centers-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const { data } = await api.post('/export/pdf', {
        headers,
        rows,
        title: 'Store Centers Report',
        filename: `store-centers-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `store-centers-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Centers"
        description="Manage distribution and storage locations"
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="inventory.locations.export">
              {locations.length > 0 && (
                <div className="flex gap-1">
                  <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                  <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                  <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
                </div>
              )}
            </PermissionGuard>
            <PermissionGuard permission="inventory.products.create">
              <Button onClick={() => setOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
                + Add Store
              </Button>
            </PermissionGuard>
          </div>
        }
      />
      <DataTable columns={columns} data={locations} sorting={sorting} onSortingChange={setSorting} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Store Center</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} disabled={submitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
