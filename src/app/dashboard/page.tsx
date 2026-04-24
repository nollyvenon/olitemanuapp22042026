'use client';

import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to OMCLTA</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h2>
        <dl className="space-y-3">
          <div>
            <dt className="font-semibold text-gray-700">Email</dt>
            <dd className="text-gray-600">{user?.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-700">Permissions</dt>
            <dd className="text-gray-600">{user?.permissions?.join(', ') || 'None'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-700">Groups</dt>
            <dd className="text-gray-600">{user?.groups?.map((g: any) => g.name).join(', ') || 'None'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
