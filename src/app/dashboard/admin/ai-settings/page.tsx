'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiClient } from '@/lib/api-client';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AiSettingsPage() {
  const api = getApiClient();
  const [openaiKey, setOpenaiKey] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [pollingInterval, setPollingInterval] = useState('30');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/settings');
        const settings = res.data;
        setOpenaiKey(settings.openai_api_key || '');
        setAiEnabled(settings.ai_features_enabled !== false);
        setPollingInterval(String(settings.ai_polling_interval || 30));
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [api]);

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: null, message: '' });
    try {
      await api.post('/settings', {
        openai_api_key: openaiKey,
        ai_features_enabled: aiEnabled,
        ai_polling_interval: parseInt(pollingInterval)
      });
      setStatus({ type: 'success', message: 'Settings saved successfully' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to save settings' });
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Dashboard Settings"
        description="Configure AI features, OpenAI integration, and polling intervals"
      />

      {status.type && (
        <Card className={`p-4 flex gap-3 ${status.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {status.type === 'success' ? (
            <CheckCircle className={`w-5 h-5 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={`text-sm font-medium ${status.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {status.message}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* AI Features Toggle */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">AI Features</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm">Enable AI Dashboard & Insights</span>
              </label>
              <p className="text-xs text-gray-600 mt-2">
                When enabled, AI insights, predictions, and alerts are shown in the dashboard. Requires valid OpenAI API key for LLM enrichment.
              </p>
            </div>
          </div>
        </Card>

        {/* Polling Configuration */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">Update Frequency</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Polling Interval (seconds)</Label>
              <Input
                type="number"
                min="10"
                max="300"
                step="10"
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                How often the dashboard refreshes AI insights. Range: 10-300 seconds. Default: 30.
              </p>
            </div>
          </div>
        </Card>

        {/* OpenAI API Key */}
        <Card className="col-span-2 p-6">
          <h3 className="font-bold mb-4">OpenAI Integration</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="openai-key" className="text-sm">API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="mt-2 font-mono text-xs"
              />
              <p className="text-xs text-gray-600 mt-2">
                Your OpenAI API key for GPT-4o-mini. Get it at <a href="https://platform.openai.com/api-keys" className="text-blue-600 underline" target="_blank">platform.openai.com</a>.
                Leave empty to use rule-based insights only.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <p className="font-semibold mb-1">✓ What OpenAI Enables</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Deep reasoning on anomalies and trends</li>
                <li>AI-generated business recommendations</li>
                <li>Context-aware risk assessment</li>
                <li>Multi-module correlation analysis</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ background: '#FF9900', color: '#0f1111' }}
          className="font-semibold"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
