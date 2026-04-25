import { useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface HelpItem {
  id: string;
  title: string;
  content: string;
}

export const useContextHelp = (module: string) => {
  const api = getApiClient();
  const [help, setHelp] = useState<HelpItem | null>(null);
  const [loading, setLoading] = useState(false);

  const openHelp = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/manuals/search?q=${module}`);
      if (res.data.length > 0) setHelp(res.data[0]);
    } catch (err) {
      console.error('Failed to load help', err);
    } finally {
      setLoading(false);
    }
  };

  const closeHelp = () => setHelp(null);

  return { help, loading, openHelp, closeHelp };
};
