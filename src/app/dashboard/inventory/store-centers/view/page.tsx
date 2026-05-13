'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { getApiClient } from '@/lib/api-client';

interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
}

const columns: ColumnDef<Location>[] = [
  { accessorKey: 'name', header: 'Name', cell: (i) => <span className="font-medium text-sm">{String(i.getValue())}</span> },
  { accessorKey: 'city', header: 'City', cell: (i) => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'state', header: 'State', cell: (i) => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'country', header: 'Country', cell: (i) => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
];

export default function ViewStoreCentersPage() {
  const api = getApiClient();
  const [locations, setLocations] = useState<Location[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get('/locations');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setLocations(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="View Store Centers" description="Read-only list of all store centers (locations)." />
      <DataTable columns={columns} data={locations} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
