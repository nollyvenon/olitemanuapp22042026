'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { getApiClient } from '@/lib/api-client';
import { Search } from 'lucide-react';

interface Manual {
  id: string;
  title: string;
  content: string;
  module: string;
  slug: string;
}

export default function ManualPage() {
  const api = getApiClient();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [selected, setSelected] = useState<Manual | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/manuals');
        const data = res.data;
        setManuals(data);
        setModules([...new Set(data.map((m: Manual) => m.module))]);
        if (data.length > 0) setSelected(data[0]);
      } catch (err) {
        console.error('Failed to load manuals', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q) {
      const res = await api.get('/manuals');
      setManuals(res.data);
      return;
    }
    const res = await api.get(`/manuals/search?q=${q}`);
    setManuals(res.data);
  };

  const filtered = search ? manuals : manuals.filter(m => !modules.length || modules.includes(m.module));
  const grouped = Object.groupBy(filtered, (m: Manual) => m.module);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Manual" description="Self-service documentation and guides" />

      <div className="grid grid-cols-4 gap-6 h-96">
        <div className="col-span-1 border rounded-lg p-4 overflow-auto bg-gray-50">
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 border rounded text-sm"
            />
          </div>
          {Object.entries(grouped).map(([module, items]: any) => (
            <div key={module} className="mb-4">
              <h3 className="font-bold text-sm text-gray-700 mb-2">{module}</h3>
              {items.map((m: Manual) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left px-3 py-2 rounded text-xs mb-1 ${
                    selected?.id === m.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  {m.title}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="col-span-3 border rounded-lg p-6 overflow-auto">
          {selected ? (
            <div>
              <h1 className="text-3xl font-bold mb-4">{selected.title}</h1>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selected.content }} />
            </div>
          ) : (
            <p className="text-gray-500">Select a manual to view</p>
          )}
        </div>
      </div>
    </div>
  );
}
