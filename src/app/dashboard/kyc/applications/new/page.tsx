'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/PageHeader';
import { getApiClient } from '@/lib/api-client';
import { usePermission } from '@/hooks/usePermission';

export default function NewKycApplicationPage() {
  const router = useRouter();
  const api = getApiClient();
  const [sig, setSig] = useState<'' | 'file' | 'none'>('');
  const [sigName, setSigName] = useState('');
  const [applicant, setApplicant] = useState('');
  const [business_type, setBusinessType] = useState('');
  const [business_name, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [registration_number, setReg] = useState('');
  const [tax_id, setTax] = useState('');
  const [contact_person, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [onBehalf, setOnBehalf] = useState('');
  const [userOpts, setUserOpts] = useState<{ id: string; name: string }[]>([]);
  const { canAny } = usePermission();
  const canProxy = canAny(['sales.orders.approve', 'admin.*']);

  useEffect(() => {
    if (!canProxy) return;
    api
      .get('/users')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data as { data?: { id: string; name: string }[] })?.data ?? [];
        setUserOpts(list.map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })));
      })
      .catch(() => setUserOpts([]));
  }, [api, canProxy]);

  const gateOk = sig === 'none' || (sig === 'file' && !!sigName);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!gateOk) {
      setErr('Complete signed form step');
      return;
    }
    const req = [applicant, business_type, business_name, industry, registration_number, tax_id, contact_person, email, phone, address];
    if (req.some((x) => !String(x).trim())) {
      setErr('All fields required');
      return;
    }
    if (!confirm('All KYC fields correct? OK=YES submit, Cancel=NO to edit.')) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('applicant', applicant.trim());
      fd.append('business_type', business_type.trim());
      fd.append('business_name', business_name.trim());
      fd.append('industry', industry.trim());
      fd.append('registration_number', registration_number.trim());
      fd.append('tax_id', tax_id.trim());
      fd.append('contact_person', contact_person.trim());
      fd.append('email', email.trim());
      fd.append('phone', phone.trim());
      fd.append('address', address.trim());
      fd.append('signed_form_status', sig);
      if (sig === 'file' && (document.getElementById('kyc-sig') as HTMLInputElement)?.files?.[0]) {
        fd.append('signed_account_opening_form', (document.getElementById('kyc-sig') as HTMLInputElement).files![0]);
      }
      if (onBehalf) {
        fd.append('on_behalf_user_id', onBehalf);
        fd.append('created_as_proxy', '1');
      }
      await api.post('/kyc/applications', fd);
      router.push('/dashboard/kyc/applications');
    } catch (e: unknown) {
      const x = e as { response?: { data?: { message?: string } } };
      setErr(x.response?.data?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <PageHeader title="New KYC" description="Signed account opening form gate applies before the form." />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Card className="p-4 space-y-3">
        {!sig ? (
          <>
            <Button type="button" className="w-full bg-slate-700 text-white" onClick={() => document.getElementById('kyc-sig')?.click()}>
              Attach signed account opening form
            </Button>
            <input
              id="kyc-sig"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setSigName(f.name);
                  setSig('file');
                }
              }}
            />
            {sigName && <p className="text-xs text-green-700">{sigName}</p>}
            <Button type="button" variant="outline" className="w-full" onClick={() => { setSig('none'); setSigName(''); }}>
              No signed account opening form
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-600">{sig === 'file' ? `Attached: ${sigName}` : 'No signed form selected'}</p>
        )}
      </Card>
      {gateOk && (
        <form onSubmit={submit} className="space-y-3">
          {canProxy && userOpts.length > 0 && (
            <div>
              <Label>On behalf of (optional)</Label>
              <select className="w-full mt-1 border rounded p-2 text-sm" value={onBehalf} onChange={(e) => setOnBehalf(e.target.value)}>
                <option value="">—</option>
                {userOpts.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label>Applicant *</Label>
            <Input className="mt-1" required value={applicant} onChange={(e) => setApplicant(e.target.value)} />
          </div>
          <div>
            <Label>Business type *</Label>
            <Input className="mt-1" required value={business_type} onChange={(e) => setBusinessType(e.target.value)} />
          </div>
          <div>
            <Label>Business name *</Label>
            <Input className="mt-1" required value={business_name} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <Label>Industry *</Label>
            <Input className="mt-1" required value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div>
            <Label>Registration number *</Label>
            <Input className="mt-1" required value={registration_number} onChange={(e) => setReg(e.target.value)} />
          </div>
          <div>
            <Label>Tax ID *</Label>
            <Input className="mt-1" required value={tax_id} onChange={(e) => setTax(e.target.value)} />
          </div>
          <div>
            <Label>Contact person *</Label>
            <Input className="mt-1" required value={contact_person} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" className="mt-1" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Phone *</Label>
            <Input className="mt-1" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Address *</Label>
            <Input className="mt-1" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-amber-600 text-white">
            {busy ? '…' : 'Submit'}
          </Button>
        </form>
      )}
    </div>
  );
}
