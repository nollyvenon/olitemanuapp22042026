'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { getApiClient } from '@/lib/api-client';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Plan {
  id: string;
  vetting_status: string;
  frequency: string;
  plan_date: string;
}

interface Report {
  id: string;
  report_title: string;
  vetting_status?: string;
}

export default function MarketPage() {
  const api = getApiClient();
  const [planning, setPlanning] = useState<Plan[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [vetPlan, setVetPlan] = useState<Plan | null>(null);
  const [vetRep, setVetRep] = useState<Report | null>(null);
  const [vetRemark, setVetRemark] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, r] = await Promise.all([api.get('/market/planning'), api.get('/market/reports')]);
    setPlanning(Array.isArray(p.data) ? p.data : (p.data as { data?: Plan[] })?.data ?? []);
    setReports(Array.isArray(r.data) ? r.data : (r.data as { data?: Report[] })?.data ?? []);
  }, [api]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const submitVet = async () => {
    if (!vetRemark.trim()) return;
    if (!confirm('Mark as vetted?')) return;
    setBusy(true);
    try {
      if (vetPlan) await api.post(`/market/planning/${vetPlan.id}/vet`, { remark: vetRemark.slice(0, 1000) });
      else if (vetRep) await api.post(`/market/reports/${vetRep.id}/vet`, { remark: vetRemark.slice(0, 1000) });
      setVetPlan(null);
      setVetRep(null);
      setVetRemark('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Market Intelligence</h1>
      <Tabs defaultValue="planning">
        <TabsList>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="planning">
          <Card className="p-6">
            <Button className="mb-4 bg-blue-600 text-white">New Plan</Button>
            <div className="space-y-2">
              {planning.map((p) => (
                <div key={p.id} className="p-3 border rounded flex items-center justify-between gap-2">
                  <div>
                    <span className={`px-2 py-1 text-xs rounded ${p.vetting_status === 'VETTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.vetting_status === 'VETTED' ? 'vetted' : 'not vetted'}
                    </span>
                    <p className="mt-1">
                      {p.frequency} - {p.plan_date}
                    </p>
                  </div>
                  <PermissionGuard permission="sales.orders.approve">
                    {p.vetting_status !== 'VETTED' && (
                      <Button size="sm" variant="outline" onClick={() => { setVetPlan(p); setVetRep(null); setVetRemark(''); }}>
                        Vet
                      </Button>
                    )}
                  </PermissionGuard>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card className="p-6">
            <Button className="mb-4 bg-blue-600 text-white">New Report</Button>
            {reports.length === 0 ? (
              <p>No reports</p>
            ) : (
              <div>
                {reports.map((r) => (
                  <div key={r.id} className="mb-3 p-3 border rounded flex justify-between items-center gap-2">
                    <span>{r.report_title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${r.vetting_status === 'VETTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {r.vetting_status === 'VETTED' ? 'vetted' : 'not vetted'}
                      </span>
                      <PermissionGuard permission="sales.orders.approve">
                        {r.vetting_status !== 'VETTED' && (
                          <Button size="sm" variant="outline" onClick={() => { setVetRep(r); setVetPlan(null); setVetRemark(''); }}>
                            Vet
                          </Button>
                        )}
                      </PermissionGuard>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      <Sheet open={!!vetPlan || !!vetRep} onOpenChange={(o) => { if (!o) { setVetPlan(null); setVetRep(null); } }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{vetPlan ? 'Vet plan' : 'Vet report'}</SheetTitle>
          </SheetHeader>
          <Label className="mt-4">Remark (max 1000)</Label>
          <textarea className="w-full mt-2 border rounded p-2 text-sm min-h-[100px]" maxLength={1000} value={vetRemark} onChange={(e) => setVetRemark(e.target.value)} />
          <p className="text-xs text-gray-500 mt-1">{vetRemark.length}/1000</p>
          <SheetFooter className="mt-4">
            <Button disabled={busy || !vetRemark.trim() || (!vetPlan && !vetRep)} onClick={submitVet} className="w-full bg-amber-600 text-white">
              {busy ? '…' : 'Submit vet'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
