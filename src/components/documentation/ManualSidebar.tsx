'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  manuals: Array<{ id: string; title: string; slug: string }>;
}

export function ManualSidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const api = getApiClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/documentation/categories');
        setCategories(data.data);
        if (data.data.length > 0) setExpandedCategories([data.data[0].id]);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    load();
  }, [api]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <h2 className="text-lg font-bold mb-6 text-gray-900">Documentation</h2>
      <nav className="space-y-2">
        {categories.map(category => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
            >
              {category.name}
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`} />
            </button>
            {expandedCategories.includes(category.id) && (
              <ul className="ml-4 space-y-1 mt-1">
                {category.manuals.map(manual => (
                  <li key={manual.id}>
                    <Link href={`/help/${manual.slug}`} className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                      {manual.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
