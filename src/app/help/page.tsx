'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ManualSearch } from '@/components/documentation/ManualSearch';
import { BookOpen, Search, Sparkles, Clock } from 'lucide-react';

interface Manual {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  view_count: number;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  manuals: Manual[];
}

export default function HelpPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentManuals, setRecentManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const api = getApiClient();

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, manualRes] = await Promise.all([
          api.get('/documentation/categories'),
          api.get('/documentation/manuals?per_page=5'),
        ]);
        setCategories(catRes.data.data);
        setRecentManuals((manualRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load help content', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">OMCLTA ERP Help</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">Complete guides, tutorials, and support for your ERP system</p>
          <div className="max-w-xl mx-auto">
            <ManualSearch />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link href="/help/getting-started" className="p-6 bg-white rounded-lg shadow hover:shadow-md transition border-l-4 border-blue-600">
            <div className="flex items-start">
              <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Getting Started</h3>
                <p className="text-sm text-gray-600">Learn the basics</p>
              </div>
            </div>
          </Link>
          <button className="p-6 bg-white rounded-lg shadow hover:shadow-md transition border-l-4 border-purple-600 text-left">
            <div className="flex items-start">
              <Sparkles className="h-6 w-6 text-purple-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Ask AI</h3>
                <p className="text-sm text-gray-600">Get instant answers</p>
              </div>
            </div>
          </button>
          <a href="/dashboard/admin/documentation" className="p-6 bg-white rounded-lg shadow hover:shadow-md transition border-l-4 border-green-600">
            <div className="flex items-start">
              <Search className="h-6 w-6 text-green-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">All Articles</h3>
                <p className="text-sm text-gray-600">Browse documentation</p>
              </div>
            </div>
          </a>
        </div>

        {/* Categories */}
        {!loading && categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentation by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h3>
                  <ul className="space-y-2">
                    {category.manuals.slice(0, 5).map(manual => (
                      <li key={manual.id}>
                        <Link href={`/help/${manual.slug}`} className="text-blue-600 hover:text-blue-800 text-sm">
                          • {manual.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {category.manuals.length > 5 && (
                    <p className="text-xs text-gray-500 mt-3">+{category.manuals.length - 5} more articles</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Articles */}
        {recentManuals.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
            </div>
            <div className="space-y-3">
              {recentManuals.map(manual => (
                <Link key={manual.id} href={`/help/${manual.slug}`} className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{manual.title}</h3>
                      <p className="text-sm text-gray-600">{manual.excerpt}</p>
                      <p className="text-xs text-gray-500 mt-2">{manual.category.name}</p>
                    </div>
                    <span className="text-xs text-gray-400">{manual.view_count} views</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="border-b pb-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">How do I reset my password?</summary>
              <p className="text-gray-600 mt-2">Visit the login page and click "Forgot Password". Follow the email instructions to reset your password.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">How do I create a sales order?</summary>
              <p className="text-gray-600 mt-2">Go to Sales → Orders and click "Create Order". See our <Link href="/help/sales-orders" className="text-blue-600 hover:underline">Sales Orders guide</Link> for detailed steps.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">What permissions do I need?</summary>
              <p className="text-gray-600 mt-2">Permissions are assigned through groups. Contact your administrator to be added to the appropriate group for your role.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
