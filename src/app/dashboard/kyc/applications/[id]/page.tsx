'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getApiClient } from '@/lib/api-client';

interface KycApplicationDetail {
  id: string;
  ref: string;
  applicant: string;
  business_type: string;
  business_name?: string;
  industry?: string;
  registration_number?: string;
  tax_id?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitted_date: string;
  reviewed_by?: string;
  reviewed_date?: string;
  rejection_reason?: string;
  status: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploaded_date: string;
  verified: boolean;
}

const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function KycApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = getApiClient();
  const id = params.id as string;

  const [application, setApplication] = useState<KycApplicationDetail | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, docsRes] = await Promise.all([
          api.get(`/kyc/applications/${id}`),
          api.get(`/kyc/applications/${id}/documents`),
        ]);
        const appData = appRes.data.data || appRes.data;
        setApplication(appData);
        const docsList = Array.isArray(docsRes.data) ? docsRes.data : docsRes.data.data || [];
        setDocuments(docsList);
      } catch (err) {
        console.error('Failed to load application', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, api]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!application) return <div className="p-6">Application not found</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{application.applicant}</h1>
          <p className="text-gray-600 mt-1">{application.ref}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      <div className="flex gap-4">
        <Card className="p-4 flex-1">
          <p className="text-xs text-gray-600 font-semibold">Status</p>
          <div className="mt-2">
            <StatusBadge status={application.status} />
          </div>
        </Card>
        <Card className="p-4 flex-1">
          <p className="text-xs text-gray-600 font-semibold">Business Type</p>
          <p className="text-sm font-medium mt-2">{application.business_type}</p>
        </Card>
        <Card className="p-4 flex-1">
          <p className="text-xs text-gray-600 font-semibold">Submitted</p>
          <p className="text-sm font-medium mt-2">{fmtDate(application.submitted_date)}</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Application Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Business Name</p>
            <p className="text-sm font-medium mt-1">{application.business_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Industry</p>
            <p className="text-sm font-medium mt-1">{application.industry || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Registration Number</p>
            <p className="text-sm font-medium mt-1">{application.registration_number || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Tax ID</p>
            <p className="text-sm font-medium mt-1">{application.tax_id || '—'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Contact Person</p>
            <p className="text-sm font-medium mt-1">{application.contact_person || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Email</p>
            <p className="text-sm font-medium mt-1">{application.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Phone</p>
            <p className="text-sm font-medium mt-1">{application.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Address</p>
            <p className="text-sm font-medium mt-1">{application.address || '—'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Review Information</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Reviewed By</p>
            <p className="text-sm font-medium mt-1">{application.reviewed_by || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Reviewed Date</p>
            <p className="text-sm font-medium mt-1">{fmtDate(application.reviewed_date)}</p>
          </div>
          {application.rejection_reason && (
            <div>
              <p className="text-xs text-gray-600 font-semibold">Rejection Reason</p>
              <p className="text-sm font-medium mt-1">{application.rejection_reason}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Documents</h2>
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type} • {fmtDate(doc.uploaded_date)}</p>
                </div>
                <div>
                  {doc.verified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">Verified</span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No documents uploaded</p>
        )}
      </Card>
    </div>
  );
}
