// utils/fingerprint.ts

const FINGERPRINT_KEY = 'device_fingerprint';

function generateFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr-fallback';

  const components = [
    navigator.userAgent,
    navigator.language,
    String(screen.colorDepth),
    String(screen.width) + 'x' + String(screen.height),
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency ?? ''),
    String((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? ''),
  ];

  // Simple hash
  const raw = components.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function getOrCreateFingerprint(): Promise<string> {
  // Guard: never run on the server
  if (typeof window === 'undefined') return 'ssr-fallback';

  try {
    const stored = localStorage.getItem(FINGERPRINT_KEY);
    if (stored) return stored;

    const fp = generateFingerprint();
    localStorage.setItem(FINGERPRINT_KEY, fp);
    return fp;
  } catch {
    return generateFingerprint();
  }
}