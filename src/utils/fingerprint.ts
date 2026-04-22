export async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency?.toString() || '',
    navigator.deviceMemory?.toString() || '',
    navigator.maxTouchPoints?.toString() || '',
    screen.width + 'x' + screen.height,
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.plugins.length.toString(),
  ];

  const combined = components.join('|');
  return await hashString(combined);
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getCachedFingerprint(key = 'device_fingerprint'): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export async function getOrCreateFingerprint(
  key = 'device_fingerprint'
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot generate fingerprint outside of browser');
  }

  const cached = getCachedFingerprint(key);
  if (cached) return cached;

  const fingerprint = await generateDeviceFingerprint();
  localStorage.setItem(key, fingerprint);
  return fingerprint;
}
