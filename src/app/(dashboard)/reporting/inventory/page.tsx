'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function InventoryReportPage() {
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    exclude_zero: false,
    transaction_only: false,
  });
  const api = getApiClient();

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/reporting/inventory', { params: filters });
      setReport(res.data.data);
    } catch (error) {
      console.error('Failed to load report', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const res = await api.post('/api/v1/reporting/inventory/export', { ...filters, format });
      const link = document.createElement('a');
      link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data.data));
      link.download = `inventory-report.${format}`;
      link.click();
    } catch (error) {
      console.error('Failed to export', error);
    }
  };

  return (
    <div className="p-6">
      <Link href="/dashboard/reporting"><Button variant="outline" className="mb-6">← Back</Button></Link>
      
      <Card className="p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6">Inventory Report</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input type="date" value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <Input type="date" value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value})} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input type="checkbox" checked={filters.exclude_zero} onChange={(e) => setFilters({...filters, exclude_zero: e.target.checked})} className="mr-2" />
              <span className="text-sm">Exclude Zero</span>
            </label>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={loadReport} disabled={loading} className="flex-1">
              {loading ? 'Loading...' : 'Load'}
            </Button>
            <Button onClick={() => exportReport('csv')} variant="outline" size="sm">CSV</Button>
          </div>
        </div>
      </Card>

      {report.length > 0 && (
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Item</th>
                <th className="text-left py-2">Group</th>
                <th className="text-right py-2">Opening</th>
                <th className="text-right py-2">Inwards</th>
                <th className="text-right py-2">Outwards</th>
                <th className="text-right py-2">Closing</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row: any) => (
                <tr key={row.id} className="border-b">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.group_name}</td>
                  <td className="text-right py-2">{row.opening_balance}</td>
                  <td className="text-right py-2">{row.inwards}</td>
                  <td className="text-right py-2">{row.outwards}</td>
                  <td className="text-right py-2 font-semibold">{row.closing_balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
