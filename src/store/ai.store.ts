import { create } from 'zustand';

interface Insight { insight: string; risk: string; action: string; impact: number }
interface Alert { title: string; message: string; severity: string; action: string }
interface KPI { revenue_today: number; orders_today: number; low_stock_items: number; overdue_invoices: number }

interface AiState {
  insights: Insight[];
  alerts: Alert[];
  forecast: any;
  kpis: KPI | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  setInsights: (data: Insight[]) => void;
  setAlerts: (data: Alert[]) => void;
  setForecast: (data: any) => void;
  setKpis: (data: KPI) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdated: () => void;
}

export const useAiStore = create<AiState>((set) => ({
  insights: [],
  alerts: [],
  forecast: null,
  kpis: null,
  lastUpdated: null,
  isLoading: false,
  setInsights: (data) => set({ insights: data }),
  setAlerts: (data) => set({ alerts: data }),
  setForecast: (data) => set({ forecast: data }),
  setKpis: (data) => set({ kpis: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLastUpdated: () => set({ lastUpdated: new Date() }),
}));
