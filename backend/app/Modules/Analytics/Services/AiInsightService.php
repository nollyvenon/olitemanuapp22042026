<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\Http;

class AiInsightService {
    public function __construct(
        private InsightGeneratorService $insights,
        private AlertService $alerts,
        private ForecastService $forecast,
        private AccountsRiskService $accountsRisk,
        private InventoryIntelligenceService $inventory
    ) {}

    public function getInsights(): array {
        $dailyInsights = $this->insights->generateDailyInsights();
        $activeAlerts = $this->alerts->getActiveAlerts();
        $salesForecast = $this->forecast->getSalesForecasts();
        $accountsInsights = $this->accountsRisk->getInsights();
        $inventoryInsights = $this->inventory->getInsights();

        $structured = [
            'insights' => array_map(fn($i) => [
                'insight' => $i['insight'] ?? '',
                'risk' => $i['severity'] ?? 'info',
                'action' => $i['recommended_action'] ?? '',
                'impact' => $this->mapSeverityToImpact($i['severity'] ?? 'info')
            ], $dailyInsights),
            'alerts' => array_map(fn($a) => [
                'title' => $a['title'] ?? '',
                'message' => $a['message'] ?? '',
                'severity' => $a['severity'] ?? 'info',
                'action' => $a['action'] ?? ''
            ], $activeAlerts),
            'forecast_summary' => [
                'sales_7d' => $salesForecast['forecast_7d'] ?? [],
                'risk_level' => $this->calculateRiskLevel($accountsInsights, $inventoryInsights)
            ],
            'kpis' => [
                'revenue_today' => $this->getRevenueToday(),
                'orders_today' => $this->getOrdersToday(),
                'low_stock_items' => count($inventoryInsights['low_stock_alerts'] ?? []),
                'overdue_invoices' => count($accountsInsights['overdue_customers'] ?? [])
            ]
        ];

        if ($openaiKey = env('OPENAI_API_KEY')) {
            $structured['ai_enrichment'] = $this->enrichWithOpenAI($structured);
        }

        return $structured;
    }

    private function enrichWithOpenAI(array $data): array {
        try {
            $prompt = "Analyze this ERP data and provide 3 actionable business recommendations:\n" . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

            $response = Http::withToken(env('OPENAI_API_KEY'))->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.7,
                'max_tokens' => 500
            ]);

            return $response->json()['choices'][0]['message']['content'] ?? '';
        } catch (\Exception $e) {
            return '';
        }
    }

    private function mapSeverityToImpact(string $severity): int {
        return match($severity) {
            'critical' => 3,
            'warning' => 2,
            default => 1
        };
    }

    private function calculateRiskLevel(array $accountsInsights, array $inventoryInsights): string {
        $overdue = count($accountsInsights['overdue_customers'] ?? []);
        $lowStock = count($inventoryInsights['low_stock_alerts'] ?? []);

        if ($overdue > 5 || $lowStock > 10) return 'critical';
        if ($overdue > 2 || $lowStock > 5) return 'warning';
        return 'normal';
    }

    private function getRevenueToday(): float {
        return \Illuminate\Support\Facades\DB::selectOne("
            SELECT COALESCE(SUM(total), 0) as revenue FROM invoices
            WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelled'
        ")?->revenue ?? 0;
    }

    private function getOrdersToday(): int {
        return \Illuminate\Support\Facades\DB::selectOne("
            SELECT COUNT(*) as count FROM orders
            WHERE DATE(created_at) = CURRENT_DATE
        ")?->count ?? 0;
    }
}
