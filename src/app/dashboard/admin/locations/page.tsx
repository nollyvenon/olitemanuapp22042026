'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';
import { Edit, Trash2, Users } from 'lucide-react';

interface Location { id: string; name: string; address: string; city: string; state: string; is_active: boolean; users_count: number; }

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', city: '', state: '' });
  const [saving, setSaving] = useState(false);
  const api = getApiClient();

  const fetchLocations = useCallback(async () => {
    try {
      const { data } = await api.get('/locations');
      setLocations(Array.isArray(data) ? data : data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const saveLocation = async () => {
    if (!editLocation) return;
    setSaving(true);
    try {
      await api.patch(`/locations/${editLocation.id}`, editLocation);
      await fetchLocations();
      setEditLocation(null);
    } finally {
      setSaving(false);
    }
  };

  const createLocation = async () => {
    if (!newLocation.name || !newLocation.address) return;
    setSaving(true);
    try {
      await api.post('/locations', newLocation);
      await fetchLocations();
      setCreateOpen(false);
      setNewLocation({ name: '', address: '', city: '', state: '' });
    } finally {
      setSaving(false);
    }
  };

  const deleteLocation = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    await api.delete(`/locations/${id}`);
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const columns: ColumnDef<Location>[] = [
    { accessorKey: 'name', header: 'Location', cell: i => <span className="font-semibold text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'address', header: 'Address', cell: i => <span className="text-sm text-gray-500">{String(i.getValue())}</span> },
    { accessorKey: 'city', header: 'City', cell: i => <span className="text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'state', header: 'State', cell: i => <span className="text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'users_count', header: 'Users', cell: i => <span className="font-bold text-blue-600">{String(i.getValue() ?? 0)}</span> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <PermissionGuard permission="admin.*">
          <div className="flex items-center gap-3">
            <button onClick={() => setEditLocation(row.original)} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
              <Edit className="h-3 w-3" /> Edit
            </button>
            <button onClick={() => deleteLocation(row.original.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Manage office locations and access points"
        actions={
          <PermissionGuard permission="admin.*">
            <Button onClick={() => setCreateOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add Location</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={locations} isLoading={loading} sorting={sorting} onSortingChange={setSorting} />

      <Sheet open={!!editLocation} onOpenChange={o => !o && setEditLocation(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader><SheetTitle>Edit Location</SheetTitle></SheetHeader>
          {editLocation && (
            <div className="mt-4 space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={editLocation.name} onChange={e => setEditLocation(p => ({ ...p, name: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Address *</Label>
                <Input value={editLocation.address} onChange={e => setEditLocation(p => ({ ...p, address: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={editLocation.city} onChange={e => setEditLocation(p => ({ ...p, city: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={editLocation.state} onChange={e => setEditLocation(p => ({ ...p, state: e.target.value }))} className="mt-1.5" />
              </div>
            </div>
          )}
          <SheetFooter className="mt-6">
            <Button onClick={saveLocation} disabled={saving} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Saving...' : 'Save Location'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader><SheetTitle>Add Location</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={newLocation.name} onChange={e => setNewLocation(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Lagos Branch" className="mt-1.5" />
            </div>
            <div>
              <Label>Address *</Label>
              <Input value={newLocation.address} onChange={e => setNewLocation(p => ({ ...p, address: e.target.value }))} placeholder="e.g. 123 Main St" className="mt-1.5" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={newLocation.city} onChange={e => setNewLocation(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Lagos" className="mt-1.5" />
            </div>
            <div>
              <Label>State</Label>
              <Input value={newLocation.state} onChange={e => setNewLocation(p => ({ ...p, state: e.target.value }))} placeholder="e.g. Lagos" className="mt-1.5" />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={createLocation} disabled={saving || !newLocation.name} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Creating...' : 'Create Location'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
