'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, MapPin } from 'lucide-react';
import { getOrCreateFingerprint } from '@/utils/fingerprint';

type LoginInput = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const locationRef = useRef<{ latitude?: number; longitude?: number; gps_source: string }>({ gps_source: 'pending' });
  const fingerprintRef = useRef<string>('');
  const userAgentRef = useRef<string>('');

  useEffect(() => {
    // All browser APIs are safe inside useEffect — runs client-side only
    getOrCreateFingerprint().then((fp) => {
      fingerprintRef.current = fp;
    });

    userAgentRef.current = navigator.userAgent; // Safe here — inside useEffect

    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationRef.current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          gps_source: 'gps',
        };
        setLocationStatus('granted');
      },
      () => {
        locationRef.current = { gps_source: 'denied' };
        setLocationStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = async (data: LoginInput) => {
    if (locationStatus === 'pending') {
      setGlobalError('Waiting for location access...');
      return;
    }
    if (locationStatus !== 'granted' || locationRef.current.gps_source !== 'gps') {
      setGlobalError('Enable device location (GPS) to sign in.');
      return;
    }
    setGlobalError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password, {
        device_fingerprint: fingerprintRef.current || 'unknown',
        user_agent: userAgentRef.current || '',
        ...locationRef.current,
      });
      router.push('/dashboard/overview');
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'Failed to log in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-[#d5d9d9]">
      {/* Header banner */}
      <div className="bg-[#232f3e] px-8 py-6 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#FF9900] flex items-center justify-center">
            <span className="text-[#0f1111] font-black text-sm">OL</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">OLITE ERP</span>
        </div>
        <p className="text-[#aab7c4] text-xs mt-1">Manufacturing Operations Platform</p>
      </div>

      <div className="px-8 py-6">
        <h2 className="text-[#0f1111] font-bold text-lg mb-1">Sign in</h2>
        <p className="text-[#555555] text-sm mb-6">Access your manufacturing dashboard</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {globalError && (
            <div className="flex items-start gap-2 p-3 bg-[#fff3cd] border border-[#ffc107] rounded text-sm text-[#856404]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[#0f1111] font-medium text-sm">
              Email address
            </Label>
            <Input
              id="email"
              placeholder="you@company.com"
              className="border-[#d5d9d9] focus-visible:border-[#FF9900] focus-visible:ring-[#FF9900]/20 h-10"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
              })}
              disabled={isLoading}
            />
            {errors.email && <p className="text-xs text-[#cc0c39]">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[#0f1111] font-medium text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-[#d5d9d9] focus-visible:border-[#FF9900] focus-visible:ring-[#FF9900]/20 h-10"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
              disabled={isLoading}
            />
            {errors.password && <p className="text-xs text-[#cc0c39]">{errors.password.message}</p>}
          </div>

          <div
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded ${
              locationStatus === 'granted'
                ? 'bg-green-50 text-green-700'
                : locationStatus === 'denied'
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-gray-50 text-gray-500'
            }`}
          >
            <MapPin className="h-3 w-3 shrink-0" />
            {locationStatus === 'pending' && 'Requesting location access...'}
            {locationStatus === 'granted' && 'GPS location captured'}
            {locationStatus === 'denied' && 'Location required — allow GPS in browser settings'}
          </div>

          <button
            type="submit"
            disabled={isLoading || locationStatus === 'pending' || locationStatus === 'denied'}
            className="w-full h-10 bg-[#FF9900] hover:bg-[#e88b00] text-[#0f1111] font-bold rounded text-sm transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isLoading
              ? 'Signing in...'
              : locationStatus === 'pending'
              ? 'Waiting for location...'
              : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#e7e7e7] text-center">
          <p className="text-xs text-[#767676]">
            By signing in, you agree to Olite ERP&apos;s terms of service
          </p>
        </div>
      </div>
    </div>
  );
}