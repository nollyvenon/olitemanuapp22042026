'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HelpCircle, ExternalLink } from 'lucide-react';

interface ContextHelp {
  id: string;
  manual_id: string;
  page_route: string;
  manual: { id: string; title: string; slug: string; excerpt: string };
}

export function ContextHelpModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState<ContextHelp | null>(null);
  const api = getApiClient();

  useEffect(() => {
    const loadContextHelp = async () => {
      try {
        const response = await api.get(`/documentation/contextual-help?page=${pathname}`);
        if (response.data.data) {
          setHelp(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load context help', err);
      }
    };
    loadContextHelp();
  }, [pathname, api]);

  if (!help) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Get help for this page"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Help: {help.manual.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">{help.manual.excerpt}</p>
            <Link href={`/help/${help.manual.slug}`}>
              <Button className="w-full" style={{ background: '#FF9900', color: '#0f1111' }}>
                Read Full Guide <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
