<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class SalesInsightService
{
    public function getInsights(int $period): array
    {
        $kpis = $this->getKpis($period);
        $charts = $this->getCharts($period);
        $records = $this->getStalledOrders();
        $insights = $this->generateInsights($kpis, $records);
        $recommendations = $this->generateRecommendations($kpis, $insights);

        return compact('kpis', 'charts', 'records', 'insights', 'recommendations', 'period');
    }

    private function getKpis(int $period): array
    {
        $current = DB::selectOne("
            SELECT
              COUNT(*) FILTER (WHERE status = 'AUTHORIZED') AS authorized_count,
              SUM(total) FILTER (WHERE status = 'AUTHORIZED') AS authorized_revenue,
              COUNT(*) FILTER (WHERE status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','PENDING_AUTH')) AS pipeline_count,
              SUM(total) FILTER (WHERE status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','PENDING_AUTH')) AS pipeline_value,
              COUNT(*) FILTER (WHERE status = 'OVERRIDDEN') AS override_count,
              AVG(total) FILTER (WHERE status = 'AUTHORIZED') AS avg_order_value
            FROM orders
            WHERE is_current = true AND deleted_at IS NULL
              AND order_date >= NOW() - INTERVAL '{$period} days'
        ");

        $priorPeriod = $period * 2;
        $prior = DB::selectOne("
            SELECT
              SUM(total) FILTER (WHERE status = 'AUTHORIZED') AS authorized_revenue,
              AVG(total) FILTER (WHERE status = 'AUTHORIZED') AS avg_order_value
            FROM orders
            WHERE is_current = true AND deleted_at IS NULL
              AND order_date >= NOW() - INTERVAL '{$priorPeriod} days'
              AND order_date < NOW() - INTERVAL '{$period} days'
        ");

        return [
            'authorized_revenue' => [
                'value' => (float) ($current->authorized_revenue ?? 0),
                'prior_value' => (float) ($prior->authorized_revenue ?? 0),
                'change_pct' => $this->calcChange($current->authorized_revenue ?? 0, $prior->authorized_revenue ?? 0),
            ],
            'pipeline_value' => [
                'value' => (float) ($current->pipeline_value ?? 0),
            ],
            'authorized_count' => [
                'value' => (int) ($current->authorized_count ?? 0),
            ],
            'avg_order_value' => [
                'value' => (float) ($current->avg_order_value ?? 0),
                'prior_value' => (float) ($prior->avg_order_value ?? 0),
                'change_pct' => $this->calcChange($current->avg_order_value ?? 0, $prior->avg_order_value ?? 0),
            ],
        ];
    }

    private function getCharts(int $period): array
    {
        $trend = DB::select("
            SELECT DATE_TRUNC('day', order_date)::date AS date,
                   COUNT(*) AS orders, SUM(total) AS revenue
            FROM orders
            WHERE status = 'AUTHORIZED' AND is_current = true AND deleted_at IS NULL
              AND order_date >= NOW() - INTERVAL '{$period} days'
            GROUP BY 1 ORDER BY 1
        ");

        $pipeline = DB::select("
            SELECT status, COUNT(*) as count, SUM(total) as value
            FROM orders
            WHERE is_current = true AND deleted_at IS NULL
              AND order_date >= NOW() - INTERVAL '{$period} days'
            GROUP BY status
        ");

        $topCustomers = DB::select("
            SELECT c.id, c.name, c.company,
                   COUNT(o.id) AS order_count, SUM(o.total) AS revenue
            FROM orders o JOIN customers c ON c.id = o.customer_id
            WHERE o.status = 'AUTHORIZED' AND o.is_current = true AND o.deleted_at IS NULL
              AND o.order_date >= NOW() - INTERVAL '{$period} days'
            GROUP BY c.id ORDER BY revenue DESC LIMIT 10
        ");

        return [
            'trend' => array_map(fn($row) => [
                'date' => $row->date,
                'revenue' => (float) $row->revenue,
                'orders' => (int) $row->orders,
            ], $trend),
            'pipeline' => array_map(fn($row) => [
                'status' => $row->status,
                'count' => (int) $row->count,
                'value' => (float) $row->value,
            ], $pipeline),
            'topCustomers' => array_map(fn($row) => [
                'name' => $row->name,
                'revenue' => (float) $row->revenue,
            ], $topCustomers),
        ];
    }

    private function getStalledOrders(): array
    {
        return DB::select("
            SELECT o.id, o.order_number, o.status, o.total,
                   c.name AS customer_name,
                   u.name AS creator_name,
                   EXTRACT(EPOCH FROM (NOW() - o.updated_at))/3600 AS hours_stalled
            FROM orders o
            JOIN customers c ON c.id = o.customer_id
            JOIN users u ON u.id = o.created_by
            WHERE o.is_current = true AND o.deleted_at IS NULL
              AND o.status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','PENDING_AUTH')
              AND o.updated_at < NOW() - INTERVAL '48 hours'
            ORDER BY hours_stalled DESC
            LIMIT 20
        ");
    }

    private function generateInsights(array $kpis, array $records): array
    {
        $insights = [];

        if (count($records) > 0) {
            $stalledValue = array_sum(array_map(fn($r) => $r->total, $records));
            $insights[] = [
                'severity' => 'critical',
                'message' => count($records) . " orders stalled for 48h+, ₦" . number_format($stalledValue, 0) . " at risk",
                'action' => 'Review pipeline bottlenecks',
            ];
        }

        if ($kpis['authorized_revenue']['change_pct'] < -20) {
            $insights[] = [
                'severity' => 'warning',
                'message' => 'Revenue down ' . abs((int) $kpis['authorized_revenue']['change_pct']) . '% vs prior period',
                'action' => 'Contact top customers + review stalled pipeline',
            ];
        }

        if ($kpis['avg_order_value']['change_pct'] < -15) {
            $insights[] = [
                'severity' => 'info',
                'message' => 'Average order value declining by ' . abs((int) $kpis['avg_order_value']['change_pct']) . '%',
                'action' => 'Review pricing pressure',
            ];
        }

        return $insights;
    }

    private function generateRecommendations(array $kpis, array $insights): array
    {
        $recs = [];

        if (count($insights) > 0) {
            $recs[] = 'Review orders stuck in UNDER_REVIEW or PENDING_AUTH stages';
        }

        if ($kpis['authorized_revenue']['value'] == 0) {
            $recs[] = 'No authorized orders in this period — check data or expand date range';
        }

        return $recs;
    }

    private function calcChange($current, $prior): float
    {
        if ($prior == 0) return 0;
        return (($current - $prior) / $prior) * 100;
    }
}
