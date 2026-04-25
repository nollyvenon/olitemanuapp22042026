import { useEffect } from 'react';
import { getApiClient } from '@/lib/api-client';
import { useAiStore } from '@/store/ai.store';

export const useAiDashboard = () => {
  const { setInsights, setAlerts, setForecast, setKpis, setLoading, setLastUpdated } = useAiStore();
  const api = getApiClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insightsRes, forecastRes, alertsRes] = await Promise.all([
        api.get('/analytics/ai/insights').catch(() => ({ data: { insights: [], kpis: null } })),
        api.get('/analytics/ai/forecast').catch(() => ({ data: {} })),
        api.get('/analytics/ai/alerts').catch(() => ({ data: { alerts: [] } }))
      ]);

      setInsights(insightsRes.data.insights || []);
      setKpis(insightsRes.data.kpis || null);
      setForecast(forecastRes.data);
      setAlerts(alertsRes.data.alerts || []);
      setLastUpdated();
    } catch (err) {
      console.error('Failed to fetch AI data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const { insights, alerts, forecast, kpis, lastUpdated, isLoading } = useAiStore();
  return { insights, alerts, forecast, kpis, lastUpdated, isLoading, refetch: fetchData };
};
