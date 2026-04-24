'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiClient } from '@/lib/api-client';

type ReportType = 'opening' | 'inwards' | 'outwards' | 'closing';

export default function InventoryReportPage() {
  const api = getApiClient();
  const [reportType, setReportType] = useState<ReportType>('opening');
  const [data, setData] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location_id: '',
    category_id: '',
    item_id: '',
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadLocations();
    loadCategories();
    loadItems();
  }, []);

  const loadLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(Array.isArray(res.data) ? res.data : res.data.data || []);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setFilters(f => ({ ...f, location_id: res.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/stock/categories');
      setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadItems = async () => {
    try {
      const res = await api.get('/stock/items');
      setItems(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to load items', err);
    }
  };

  const loadReport = async () => {
    if (!filters.location_id) {
      alert('Please select a location');
      return;
    }
    setLoading(true);
    try {
      const params: any = { location_id: filters.location_id };
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.item_id) params.item_id = filters.item_id;

      if (reportType === 'opening' || reportType === 'closing') {
        params.date = filters.date;
      } else {
        params.from = filters.from;
        params.to = filters.to;
      }

      const res = await api.get(`/inventory-reports/${reportType}`, { params });
      setData(res.data.data || []);
    } catch (err) {
      console.error(`Failed to load ${reportType} report`, err);
      alert(`Failed to load ${reportType} report`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    if (!filters.location_id) return;
    try {
      const params: any = {
        report_type: reportType,
        location_id: filters.location_id,
        format,
      };
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.item_id) params.item_id = filters.item_id;
      if (reportType === 'opening' || reportType === 'closing') {
        params.date = filters.date;
      } else {
        params.from = filters.from;
        params.to = filters.to;
      }

      const res = await api.post('/inventory-reports/export', params, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
    } catch (err) {
      console.error('Failed to export', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Reports</h1>
        <p className="text-sm text-gray-600 mt-1">Opening balance, inwards, outwards, and closing balance reports with filtering and export</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['opening', 'inwards', 'outwards', 'closing'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type as ReportType)}
                className="px-4 py-2 rounded text-sm font-medium transition-colors capitalize"
                style={{
                  background: reportType === type ? '#FF9900' : '#f4f6f8',
                  color: reportType === type ? '#0f1111' : '#555555',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f1111' }}>Location *</label>
              <select
                value={filters.location_id}
                onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}
                className="w-full px-3 py-2 rounded text-sm"
                style={{ border: '1px solid #d5d9d9' }}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f1111' }}>Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded text-sm"
                style={{ border: '1px solid #d5d9d9' }}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f1111' }}>Item</label>
              <select
                value={filters.item_id}
                onChange={(e) => setFilters({ ...filters, item_id: e.target.value })}
                className="w-full px-3 py-2 rounded text-sm"
                style={{ border: '1px solid #d5d9d9' }}
              >
                <option value="">All items</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            {(reportType === 'opening' || reportType === 'closing') ? (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#0f1111' }}>Date</label>
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0f1111' }}>From</label>
                  <Input
                    type="date"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0f1111' }}>To</label>
                  <Input
                    type="date"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={loadReport} disabled={loading} style={{ background: '#FF9900', color: '#0f1111' }}>
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
            {data.length > 0 && (
              <>
                <Button onClick={() => exportReport('csv')} variant="outline" className="border-brand-green text-brand-green">📥 CSV</Button>
                <Button onClick={() => exportReport('pdf')} variant="outline" className="border-brand-green text-brand-green">📄 PDF</Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {data.length > 0 && (
        <Card className="p-4 overflow-x-auto">
          <div className="text-xs text-gray-600 mb-4">
            Showing {data.length} records
          </div>
          <table className="w-full text-sm">
            <thead style={{ background: '#f4f6f8', borderBottom: '1px solid #d5d9d9' }}>
              <tr>
                {reportType === 'opening' || reportType === 'closing' ? (
                  <>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>Item</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>SKU</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>Quantity</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>Value</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>Item</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>SKU</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>Quantity</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: '#0f1111' }}>Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2 px-3" style={{ color: '#0f1111' }}>{row.name}</td>
                  <td className="py-2 px-3" style={{ color: '#555555' }}>{row.sku}</td>
                  <td className="text-right py-2 px-3 font-mono" style={{ color: '#0f1111' }}>{row.quantity?.toLocaleString()}</td>
                  <td className="text-right py-2 px-3 font-mono" style={{ color: '#0f1111' }}>{(row.value ?? row.amount ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {!loading && data.length === 0 && (
        <Card className="p-6 text-center" style={{ background: '#fff8e7' }}>
          <p style={{ color: '#c45500' }}>Click "Generate Report" to view {reportType} inventory data</p>
        </Card>
      )}
    </div>
  );
}
