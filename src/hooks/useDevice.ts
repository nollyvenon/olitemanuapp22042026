import { useEffect, useState } from 'react';
import { getOrCreateFingerprint } from '@/utils/fingerprint';

export function useDevice() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [userAgent] = useState(() => navigator.userAgent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
