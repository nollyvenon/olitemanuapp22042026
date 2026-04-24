'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Plan {
  id: string;
  vetting_status: string;
  frequency: string;
  plan_date: string;
}

interface Report {
  id: string;
  report_title: string;
}

export default function MarketPage() {
  const [planning, setPlanning] = useState<Plan[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch('/api/v1/market/planning').then(r => r.json()).then(d => setPlanning(d.data || [])).catch(e => console.error(e));
    fetch('/api/v1/market/reports').then(r => r.json()).then(d => setReports(d.data || [])).catch(e => console.error(e));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Market Intelligence</h1>
      <Tabs>
        <TabsList><TabsTrigger value="planning">Planning</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger></TabsList>
        <TabsContent value="planning"><Card className="p-6"><Button className="mb-4 bg-blue-600 text-white">New Plan</Button><div className="space-y-2">{planning.map(p => <div key={p.id} className="p-3 border rounded"><span className={`px-2 py-1 text-xs rounded ${p.vetting_status === 'VETTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.vetting_status}</span><p className="mt-1">{p.frequency} - {p.plan_date}</p></div>)}</div></Card></TabsContent>
        <TabsContent value="reports"><Card className="p-6"><Button className="mb-4 bg-blue-600 text-white">New Report</Button>{reports.length === 0 ? <p>No reports</p> : <div>{reports.map(r => <div key={r.id} className="mb-3 p-3 border rounded">{r.report_title}</div>)}</div>}</Card></TabsContent>
      </Tabs>
    </div>
  );
}
