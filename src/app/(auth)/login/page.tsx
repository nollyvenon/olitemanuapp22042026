'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setGlobalError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
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
            <Label htmlFor="email" className="text-[#0f1111] font-medium text-sm">Email address</Label>
            <Input
              id="email"
              placeholder="you@company.com"
              className="border-[#d5d9d9] focus-visible:border-[#FF9900] focus-visible:ring-[#FF9900]/20 h-10"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && <p className="text-xs text-[#cc0c39]">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[#0f1111] font-medium text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-[#d5d9d9] focus-visible:border-[#FF9900] focus-visible:ring-[#FF9900]/20 h-10"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && <p className="text-xs text-[#cc0c39]">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-[#FF9900] hover:bg-[#e88b00] text-[#0f1111] font-bold rounded text-sm transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
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
