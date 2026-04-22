'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '@/hooks/useDevice';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser, setDeviceId, setLoading } = useAuthStore();
  const { fingerprint, userAgent, isLoading: fingerLoading } = useDevice();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>(
    'idle'
  );
  const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);

  const requestGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }

    setGpsStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
        setGpsStatus('granted');
      },
      () => {
        setGpsStatus('denied');
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoading(true);

    if (!fingerprint) {
      setError('Device fingerprint not ready');
      setIsLoading(false);
      setLoading(false);
      return;
    }

    const gpsSource = coords ? 'gps' : gpsStatus === 'denied' ? 'ip_fallback' : 'manual';

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          device_fingerprint: fingerprint,
          user_agent: userAgent,
          latitude: coords?.lat,
          longitude: coords?.long,
          gps_source: gpsSource,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      setDeviceId(data.device_id);

      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  if (fingerLoading) {
    return <div className="flex items-center justify-center min-h-screen">Initializing...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="mb-6 text-2xl font-bold text-center">OMCLTA Login</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Location Access</p>
            {coords ? (
              <div className="text-sm text-green-600 mb-3">
                ✓ GPS enabled ({coords.lat.toFixed(4)}, {coords.long.toFixed(4)})
              </div>
            ) : (
              <button
                type="button"
                onClick={requestGPS}
                disabled={isLoading || gpsStatus === 'requesting'}
                className="w-full px-3 py-2 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
              >
                {gpsStatus === 'requesting' ? 'Requesting...' : 'Enable GPS'}
              </button>
            )}
            {gpsStatus === 'denied' && (
              <p className="text-xs text-orange-600 mt-2">
                GPS denied. Location will be determined from your IP address.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-xs text-gray-500 space-y-1">
          <p>Device ID: {fingerprint ? fingerprint.slice(0, 16) + '...' : 'Loading'}</p>
          <p>GPS: {gpsStatus === 'granted' ? 'Enabled' : 'Not enabled'}</p>
        </div>
      </div>
    </div>
  );
}
