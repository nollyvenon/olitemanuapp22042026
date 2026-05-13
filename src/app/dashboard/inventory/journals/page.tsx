'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JournalsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/inventory/journals/view');
  }, [router]);
  return null;
}
