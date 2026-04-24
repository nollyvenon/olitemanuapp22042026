'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function UsersPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roles: [] as string[] });
  const [error, setError] = useState('');
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        // Fetch groups
        const groupsRes = await fetch(`${baseUrl}/groups`, { headers, credentials: 'include' });
        const groupsData = await groupsRes.json();
        setGroups(Array.isArray(groupsData) ? groupsData : groupsData.data || []);

        // Fetch users
        const usersRes = await fetch(`${baseUrl}/users`, { headers, credentials: 'include' });
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoadingGroups(false);
        setLoadingUsers(false);
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users`;
      console.log('Creating user with URL:', url);
      console.log('Payload:', { name: formData.name, email: formData.email, group_ids: formData.roles });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          group_ids: formData.roles,
        }),
      });

      console.log('Response status:', res.status);
      const contentType = res.headers.get('content-type');
      console.log('Content-Type:', contentType);

      const text = await res.text();
      console.log('Raw response:', text.substring(0, 500));

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('Failed to parse JSON. Raw response:', text);
        setError(`Server error: ${res.status} - ${text.substring(0, 200)}`);
        return;
      }

      console.log('Response data:', data);

      if (!res.ok) {
        setError(data.message || data.error || data.errors?.email?.[0] || JSON.stringify(data) || 'Failed to create user');
        return;
      }

      setShowForm(false);
      setFormData({ name: '', email: '', password: '', roles: [] });
      setError('');
      alert('User created successfully');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error:', errMsg);
      setError(`Error creating user: ${errMsg}`);
    }
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage system users and permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Users</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 border rounded-md space-y-4 bg-gray-50">
            {error && <div className="p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />

            <div>
              <label className="block text-sm font-semibold mb-2">Assign Groups</label>
              {loadingGroups ? (
                <p className="text-sm text-gray-500">Loading groups...</p>
              ) : groups.length === 0 ? (
                <p className="text-sm text-red-500">No groups available</p>
              ) : (
                <div className="space-y-2">
                  {groups.map(group => (
                    <label key={group.id} className="flex items-center p-2 border rounded hover:bg-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(group.id)}
                        onChange={() => toggleRole(group.id)}
                        className="mr-3"
                      />
                      <div className="font-medium">{group.name}</div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleAddUser} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Create User
            </button>
          </div>
        )}

        {loadingUsers ? (
          <p className="text-gray-500">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold">Email</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button className="text-red-600 hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
