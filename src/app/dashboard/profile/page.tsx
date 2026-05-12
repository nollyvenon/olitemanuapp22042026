'use client';

import { useState, useEffect } from 'react';
import { getApiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { MapPin, Lock, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['groups']);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [cfPw, setCfPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [notifyOn, setNotifyOn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') setNotifyOn(localStorage.getItem('omclta_notify') === '1');
  }, []);
    return <div className="text-center p-8">Loading...</div>;
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const groupPermissionCounts = (user.groups?.length ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="View your account details, roles, and access" />

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 bg-amber-500 text-white text-xl font-bold">
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Roles / Groups */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('groups')}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                My Roles
              </CardTitle>
              <CardDescription>{user.groups?.length ?? 0} group(s) assigned</CardDescription>
            </div>
            <span className="text-gray-500">{expandedSections.includes('groups') ? '▼' : '▶'}</span>
          </div>
        </CardHeader>
        {expandedSections.includes('groups') && (
          <CardContent>
            {user.groups && user.groups.length > 0 ? (
              <div className="space-y-3">
                {user.groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{group.name}</p>
                    </div>
                    <Badge variant="outline">{group.name}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No groups assigned</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* My Permissions */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('permissions')}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                My Permissions
              </CardTitle>
              <CardDescription>{user.permissions?.length ?? 0} permission(s) granted</CardDescription>
            </div>
            <span className="text-gray-500">{expandedSections.includes('permissions') ? '▼' : '▶'}</span>
          </div>
        </CardHeader>
        {expandedSections.includes('permissions') && (
          <CardContent>
            {user.permissions && user.permissions.length > 0 ? (
              <div className="space-y-2">
                {user.permissions.map((permission, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-xs font-mono text-gray-700">{permission}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No permissions assigned</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* My Locations */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('locations')}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                My Locations
              </CardTitle>
              <CardDescription>{user.locations?.length ?? 0} location(s) accessible</CardDescription>
            </div>
            <span className="text-gray-500">{expandedSections.includes('locations') ? '▼' : '▶'}</span>
          </div>
        </CardHeader>
        {expandedSections.includes('locations') && (
          <CardContent>
            {user.locations && user.locations.length > 0 ? (
              <div className="space-y-3">
                {user.locations.map((location) => (
                  <div key={location.id} className="p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-gray-600">
                      {location.city}, {location.country}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {location.lat.toFixed(4)}, {location.long.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No locations assigned</p>
            )}
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwMsg && <p className="text-xs text-center text-gray-600">{pwMsg}</p>}
          <Input type="password" placeholder="Current password" value={curPw} onChange={(e) => setCurPw(e.target.value)} className="w-full" />
          <Input type="password" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full" />
          <Input type="password" placeholder="Confirm new password" value={cfPw} onChange={(e) => setCfPw(e.target.value)} className="w-full" />
          <Button
            variant="outline"
            className="w-full"
            disabled={pwBusy}
            onClick={async () => {
              setPwMsg('');
              if (!curPw || !newPw) {
                setPwMsg('Fill all fields');
                return;
              }
              if (newPw !== cfPw) {
                setPwMsg('New passwords do not match');
                return;
              }
              setPwBusy(true);
              try {
                await getApiClient().post('/auth/change-password', { current_password: curPw, new_password: newPw });
                setPwMsg('Password updated');
                setCurPw('');
                setNewPw('');
                setCfPw('');
              } catch (e: unknown) {
                const err = e as { response?: { data?: { message?: string } } };
                setPwMsg(err.response?.data?.message ?? 'Failed');
              } finally {
                setPwBusy(false);
              }
            }}
          >
            {pwBusy ? 'Saving...' : 'Change Password'}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              if (notifyOn) {
                localStorage.removeItem('omclta_notify');
                setNotifyOn(false);
                return;
              }
              if (typeof window !== 'undefined' && 'Notification' in window) {
                const p = await Notification.requestPermission();
                if (p === 'granted') {
                  localStorage.setItem('omclta_notify', '1');
                  setNotifyOn(true);
                }
              }
            }}
          >
            {notifyOn ? 'Turn off app notifications' : 'Enable app notifications'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
