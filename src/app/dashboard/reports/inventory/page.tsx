'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';

interface InventoryReport {
  id: string;
  code: string;
  name: string;
  category: string;
  store: string;
  qty: number;
  reorder: number;
  unit_cost: number;
  stock_value: number;
  status: string;
}

const fmt = (v: number, d = 0) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

const columns: ColumnDef<InventoryReport>[] = [
  { accessorKey: 'code',        header: 'Code',        cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',        header: 'Item',        cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'category',    header: 'Category',    cell: i => <span className="text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'store',       header: 'Store',       cell: i => <span className="text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'qty',         header: 'Qty',         cell: ({ row }) => <span className="font-bold tabular-nums" style={{ color: row.original.qty === 0 ? '#cc0c39' : row.original.qty <= row.original.reorder ? '#c45500' : '#067d62' }}>{row.original.qty.toLocaleString()}</span> },
  { accessorKey: 'reorder',     header: 'Reorder',     cell: i => <span className="tabular-nums text-sm" style={{ color: '#767676' }}>{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'unit_cost',   header: 'Unit Cost',   cell: i => <span className="tabular-nums text-sm">{fmt(i.getValue() as number, 2)}</span> },
  { accessorKey: 'stock_value', header: 'Stock Value', cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'status',      header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function InventoryReportPage() {
  const api = getApiClient();
  const [data, setData] = useState<InventoryReport[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'stock_value', desc: true }]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reports/inventory');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setData(list);
      } catch (err) {
        console.error('Failed to load inventory report', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  if (loading) return <div className="p-6">Loading...</div>;

  const filteredData = data.filter(item => {
    if (filter === 'low_stock') return item.qty <= item.reorder && item.qty > 0;
    if (filter === 'out_of_stock') return item.qty === 0;
    if (filter === 'active') return item.qty > item.reorder;
    if (searchTerm) return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase());
    return true;
  });

  const exportCSV = () => {
    const headers = ['Code', 'Item', 'Category', 'Store', 'Qty', 'Reorder', 'Unit Cost', 'Stock Value', 'Status'];
    const rows = filteredData.map(item => [item.code, item.name, item.category, item.store, item.qty, item.reorder, item.unit_cost, item.stock_value, item.status]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const categoryData = filteredData.reduce((acc: Record<string, number>, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.stock_value;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const statusData = [
    { name: 'In Stock', value: filteredData.filter(d => d.qty > d.reorder).length, fill: '#067d62' },
    { name: 'Low Stock', value: filteredData.filter(d => d.qty <= d.reorder && d.qty > 0).length, fill: '#FF9900' },
    { name: 'Out of Stock', value: filteredData.filter(d => d.qty === 0).length, fill: '#cc0c39' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Inventory Report" description="Stock levels, valuation and reorder status as at today" />
        <button onClick={exportCSV} className="px-4 py-2 rounded text-sm font-medium" style={{ background: '#067d62', color: '#fff' }}>
          📥 Export CSV
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by code or item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded text-sm"
          style={{ border: '1px solid #d5d9d9', width: '250px' }}
        />
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'active', label: 'In Stock' },
            { key: 'low_stock', label: 'Low Stock' },
            { key: 'out_of_stock', label: 'Out of Stock' },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className="px-3 py-1 rounded text-xs font-semibold transition-colors"
              style={{
                background: filter === btn.key ? '#FF9900' : '#f4f6f8',
                color: filter === btn.key ? '#0f1111' : '#555555',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Stock Value by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#767676' }} />
              <YAxis tick={{ fontSize: 11, fill: '#767676' }} />
              <Tooltip formatter={(value) => fmt(value as number)} />
              <Bar dataKey="value" fill="#146eb4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Stock Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={{ fill: '#0f1111', fontSize: 12 }}>
                {statusData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-xs text-gray-600 mb-4">
          Showing {filteredData.length} of {data.length} items • Total Stock Value: {fmt(filteredData.reduce((sum, item) => sum + item.stock_value, 0))}
        </div>
        <DataTable columns={columns} data={filteredData} sorting={sorting} onSortingChange={setSorting} />
      </Card>
    </div>
  );
}
