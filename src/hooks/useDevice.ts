import { useEffect, useState } from 'react';
import { getOrCreateFingerprint } from '@/utils/fingerprint';

export function useDevice() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [userAgent, setUserAgent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Safe here — useEffect only runs on the client, never during SSR
    setUserAgent(navigator.userAgent);

    getOrCreateFingerprint()
      .then((fp) => {
        setFingerprint(fp);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to generate device fingerprint:', error);
        setIsLoading(false);
      });
  }, []);

  return { fingerprint, userAgent, isLoading };
}