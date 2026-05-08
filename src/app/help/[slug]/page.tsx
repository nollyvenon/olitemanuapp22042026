'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { ManualSidebar } from '@/components/documentation/ManualSidebar';
import { ManualSearch } from '@/components/documentation/ManualSearch';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface Manual {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: { id: string; name: string };
  related_articles: string[];
  keywords: string[];
  helpful_count: number;
  unhelpful_count: number;
}

export default function ManualPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const api = getApiClient();

  useEffect(() => {
    const loadManual = async () => {
      try {
        const { data } = await api.get(`/documentation/manuals/${slug}`);
        setManual(data.data);
      } catch (err) {
        console.error('Failed to load manual', err);
      } finally {
        setLoading(false);
      }
    };
    loadManual();
  }, [slug, api]);

  const submitFeedback = async (rating: 'helpful' | 'unhelpful') => {
    if (!manual || feedbackGiven) return;
    try {
      await api.post(`/documentation/manuals/${manual.id}/feedback`, { rating });
      setFeedbackGiven(true);
      setManual(prev => prev ? {
        ...prev,
        helpful_count: rating === 'helpful' ? prev.helpful_count + 1 : prev.helpful_count,
        unhelpful_count: rating === 'unhelpful' ? prev.unhelpful_count + 1 : prev.unhelpful_count
      } : null);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!manual) return <div className="p-6">Manual not found</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <ManualSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">{manual.category.name}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{manual.title}</h1>
            {manual.excerpt && <p className="text-lg text-gray-600">{manual.excerpt}</p>}
          </div>

          <div className="prose max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: manual.content }} />
          </div>

          <div className="border-t pt-8 mt-8">
            <p className="text-gray-700 mb-4">Was this helpful?</p>
            <div className="flex gap-4">
              <button
                onClick={() => submitFeedback('helpful')}
                disabled={feedbackGiven}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-green-50 disabled:opacity-50"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes ({manual.helpful_count})
              </button>
              <button
                onClick={() => submitFeedback('unhelpful')}
                disabled={feedbackGiven}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-red-50 disabled:opacity-50"
              >
                <ThumbsDown className="h-4 w-4" />
                No ({manual.unhelpful_count})
              </button>
            </div>
          </div>

          {manual.related_articles && manual.related_articles.length > 0 && (
            <div className="border-t pt-8 mt-8">
              <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
              <ul className="space-y-2">
                {manual.related_articles.map(article => (
                  <li key={article}><a href={`/help/${article}`} className="text-blue-600 hover:underline">{article}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
