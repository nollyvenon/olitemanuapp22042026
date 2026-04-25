<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class InsightGeneratorService
{
    public function generateDailyInsights(): array
    {
        $insights = [];
        $insights[] = ...$this->detectSalesAnomalies();
        $insights[] = ...$this->detectReceivablesAnomalies();
        $insights[] = ...$this->detectInventoryAnomalies();
        $insights[] = ...$this->detectTrendBreakpoints();
        $insights[] = ...$this->detectCorrelations();
        return array_filter(array_merge(...array_values([$insights])));
    }

    public function generateWeeklySummary(): array
    {
        return [
            'period' => 'Week of ' . now()->startOfWeek()->format('M d'),
            'insights' => $this->generateDailyInsights(),
            'top_findings' => $this->rankInsightsBySeverity($this->generateDailyInsights()),
            'recommendations' => $this->generateRecommendations(),
        ];
    }

    private function detectSalesAnomalies(): array
    {
        $insights = [];
        $daily = DB::select("
            SELECT DATE_TRUNC('day', o.order_date)::date AS date,
                SUM(o.total) AS revenue, COUNT(*) AS orders
            FROM orders o WHERE o.status='AUTHORIZED' AND o.is_current=true
              AND o.order_date >= NOW() - INTERVAL '30 days'
            GROUP BY 1 ORDER BY 1
        ");
        if (count($daily) >= 3) {
            $values = array_map(fn($r) => (float)$r->revenue, $daily);
            $avg = array_sum($values) / count($values);
            $last = end($values);
            $pct_change = (($last - $avg) / $avg) * 100;
            if (abs($pct_change) > 20) {
                $direction = $pct_change > 0 ? 'increased' : 'dropped';
                $insights[] = [
                    'type' => 'sales_anomaly',
                    'severity' => abs($pct_change) > 40 ? 'critical' : 'warning',
                    'insight' => "Sales {$direction} " . round(abs($pct_change)) . "% today",
                    'data' => ['change_pct' => round($pct_change, 1), 'today' => $last, 'avg' => round($avg)]
                ];
            }
        }
        return $insights;
    }

    private function detectReceivablesAnomalies(): array
    {
        $insights = [];
        $overdue = DB::selectOne("
            SELECT COUNT(*) as count, SUM(total) as amount FROM invoices
            WHERE status NOT IN ('paid','cancelled') AND CURRENT_DATE - due_date::date > 90
        ");
        if ((int)$overdue->count > 5) {
            $insights[] = [
                'type' => 'receivables_risk',
                'severity' => 'critical',
                'insight' => $overdue->count . " invoices over 90 days overdue totaling ₦" . round($overdue->amount),
                'data' => ['count' => (int)$overdue->count, 'amount' => (float)$overdue->amount]
            ];
        }
        $spike = DB::selectOne("
            SELECT COUNT(*) as new_overdue FROM invoices
            WHERE status NOT IN ('paid','cancelled') AND CURRENT_DATE - created_at::date < 1
              AND CURRENT_DATE > due_date::date
        ");
        if ((int)$spike->new_overdue > 3) {
            $insights[] = [
                'type' => 'receivables_trend',
                'severity' => 'warning',
                'insight' => $spike->new_overdue . " new invoices became overdue today",
                'data' => ['count' => (int)$spike->new_overdue]
            ];
        }
        return $insights;
    }

    private function detectInventoryAnomalies(): array
    {
        $insights = [];
        $stockouts = DB::selectOne("
            SELECT COUNT(*) as count FROM stock_items si
            WHERE si.is_active = true AND NOT EXISTS (
                SELECT 1 FROM stock_ledgers sl WHERE sl.item_id = si.id AND sl.quantity > 0
            )
        ");
        if ((int)$stockouts->count > 3) {
            $insights[] = [
                'type' => 'inventory_risk',
                'severity' => 'critical',
                'insight' => $stockouts->count . " items completely out of stock",
                'data' => ['count' => (int)$stockouts->count]
            ];
        }
        $movement = DB::selectOne("
            SELECT SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END) as outbound FROM stock_journals sj
            WHERE sj.created_at >= NOW() - INTERVAL '1 day'
        ");
        $normal = DB::selectOne("
            SELECT AVG(daily) as avg_daily FROM (
                SELECT EXTRACT(DAY FROM sj.created_at)::int as day, SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END) as daily
                FROM stock_journals sj WHERE sj.created_at >= NOW() - INTERVAL '30 days'
                GROUP BY 1
            ) sub
        ");
        if ((float)$movement->outbound > (float)$normal->avg_daily * 1.5) {
            $insights[] = [
                'type' => 'inventory_trend',
                'severity' => 'info',
                'insight' => "Unusually high inventory outflow today: " . round($movement->outbound) . " units",
                'data' => ['outbound' => (float)$movement->outbound, 'normal' => round($normal->avg_daily)]
            ];
        }
        return $insights;
    }

    private function detectTrendBreakpoints(): array
    {
        $insights = [];
        $regions = DB::select("
            SELECT l.name,
                SUM(CASE WHEN o.order_date >= NOW() - INTERVAL '7 days' THEN o.total ELSE 0 END) AS this_week,
                SUM(CASE WHEN o.order_date < NOW() - INTERVAL '7 days' AND o.order_date >= NOW() - INTERVAL '14 days' THEN o.total ELSE 0 END) AS last_week
            FROM locations l
            LEFT JOIN customers c ON c.location_id = l.id
            LEFT JOIN orders o ON o.customer_id = c.id AND o.status='AUTHORIZED' AND o.deleted_at IS NULL
            GROUP BY l.id, l.name
        ");
        foreach ($regions as $r) {
            if ((float)$r->last_week > 0) {
                $change = (((float)$r->this_week - (float)$r->last_week) / (float)$r->last_week) * 100;
                if (abs($change) > 30) {
                    $direction = $change > 0 ? 'increased' : 'dropped';
                    $insights[] = [
                        'type' => 'regional_trend',
                        'severity' => abs($change) > 50 ? 'critical' : 'warning',
                        'insight' => "{$r->name} region sales {$direction} " . round(abs($change)) . "%",
                        'data' => ['region' => $r->name, 'change_pct' => round($change, 1)]
                    ];
                }
            }
        }
        return $insights;
    }

    private function detectCorrelations(): array
    {
        $insights = [];
        $top_customers = DB::select("
            SELECT c.id, c.name, SUM(o.total) as revenue
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id AND o.status='AUTHORIZED' AND o.order_date >= NOW() - INTERVAL '30 days'
            GROUP BY c.id, c.name ORDER BY revenue DESC LIMIT 3
        ");
        $region_data = DB::select("
            SELECT l.name, COUNT(DISTINCT o.id) as orders FROM locations l
            LEFT JOIN customers c ON c.location_id = l.id
            LEFT JOIN orders o ON o.customer_id = c.id AND o.status='AUTHORIZED' AND o.order_date >= NOW() - INTERVAL '7 days'
            GROUP BY l.id, l.name ORDER BY orders DESC LIMIT 1
        ");
        if (count($top_customers) >= 3 && count($region_data) > 0) {
            $top_customer_revenue = array_sum(array_map(fn($c) => (float)$c->revenue, $top_customers));
            $total_revenue = DB::selectOne("SELECT SUM(total) as total FROM orders WHERE status='AUTHORIZED' AND order_date >= NOW() - INTERVAL '30 days'")->total;
            $pct = ($top_customer_revenue / (float)$total_revenue) * 100;
            if ($pct > 50) {
                $insights[] = [
                    'type' => 'correlation',
                    'severity' => 'warning',
                    'insight' => "Top 3 customers account for " . round($pct) . "% of revenue - diversify customer base",
                    'data' => ['concentration' => round($pct, 1), 'top_customers' => count($top_customers)]
                ];
            }
        }
        return $insights;
    }

    private function rankInsightsBySeverity(array $insights): array
    {
        usort($insights, fn($a, $b) => [
            'critical' => 3, 'warning' => 2, 'info' => 1
        ][$b['severity'] ?? 'info'] <=> [
            'critical' => 3, 'warning' => 2, 'info' => 1
        ][$a['severity'] ?? 'info']);
        return array_slice($insights, 0, 5);
    }

    private function generateRecommendations(): array
    {
        $recs = [];
        $insights = $this->generateDailyInsights();
        foreach ($insights as $i) {
            if ($i['type'] === 'sales_anomaly' && $i['data']['change_pct'] < -20) {
                $recs[] = 'Investigate cause of sales drop and contact key customers';
            }
            if ($i['type'] === 'receivables_risk') {
                $recs[] = 'Escalate overdue accounts to collections team immediately';
            }
            if ($i['type'] === 'inventory_risk') {
                $recs[] = 'Immediately replenish out-of-stock items to prevent revenue loss';
            }
            if ($i['type'] === 'correlation') {
                $recs[] = 'Develop strategy to diversify customer base and reduce concentration risk';
            }
        }
        return array_unique($recs);
    }
}
