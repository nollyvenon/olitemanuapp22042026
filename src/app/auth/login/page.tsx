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
    setIsLoading(true);
    setLoading(true);

    // Get user agent safely
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // Determine GPS source
    let gpsSource = 'manual';
    if (coords) {
      gpsSource = 'gps';
    } else if (gpsStatus === 'denied') {
      gpsSource = 'ip_fallback';
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`;
      console.log('1. Submitting login to:', apiUrl);
      console.log('2. Form data:', { email, password, fingerprint, userAgent, gpsSource });

      console.log('3. Starting fetch...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          device_fingerprint: fingerprint || undefined,
          user_agent: ua || undefined,
          latitude: coords?.lat || undefined,
          longitude: coords?.long || undefined,
          gps_source: gpsSource,
        }),
      });

      console.log('4. Fetch completed');
      console.log('5. Response status:', response.status);
      console.log('6. Response headers:', Array.from(response.headers.entries()));

      let data;
      const contentType = response.headers.get('content-type');
      console.log('7. Content-Type:', contentType);

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('8. Response is not JSON, got text:', text);
        data = { error: 'Invalid response format' };
      }

      console.log('9. Response data:', data);

      // Check for errors (422, 401, 400, 500, etc.)
      if (response.status >= 400) {
        let errorMessage = 'Login failed';

        if (data.errors && typeof data.errors === 'object') {
          const fieldErrors = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgs.join(', ')}`;
            });
          errorMessage = fieldErrors.join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        console.error('Login failed with message:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        setLoading(false);
        return;
      }

      // Success
      console.log('Login successful!');
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      setDeviceId(data.device_id);
      router.push('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      console.error('Catch error:', errorMsg);
      setError('Network error. Please try again.');
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

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded whitespace-pre-wrap text-sm border border-red-400">
            {error}
          </div>
        )}

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
