<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class PerformanceInsightService
{
    public function getInsights(int $period): array
    {
        $records = $this->getRepLeaderboard($period);
        $depot = $this->getDepotComparison($period);
        $insights = $this->generateInsights($records, $depot);
        $recommendations = $this->generateRecommendations($records, $insights);

        return compact('records', 'depot', 'insights', 'recommendations', 'period');
    }

    private function getRepLeaderboard(int $period): array
    {
        return DB::select("
            SELECT
              u.id, u.name AS rep_name,
              l.name AS depot,
              COUNT(o.id) AS orders_captured,
              COUNT(o.id) FILTER (WHERE o.status = 'AUTHORIZED') AS orders_authorized,
              SUM(o.total) FILTER (WHERE o.status = 'AUTHORIZED') AS authorized_revenue,
              AVG(o.total) FILTER (WHERE o.status = 'AUTHORIZED') AS avg_order_value,
              ROUND(
                COUNT(o.id) FILTER (WHERE o.status = 'AUTHORIZED')::numeric /
                NULLIF(COUNT(o.id) FILTER (WHERE o.status <> 'DRAFT'), 0) * 100, 1
              ) AS conversion_pct
            FROM users u
            JOIN user_locations ul ON ul.user_id = u.id
            JOIN locations l ON l.id = ul.location_id
            LEFT JOIN orders o ON o.created_by = u.id
              AND o.is_current = true AND o.deleted_at IS NULL
              AND o.order_date >= NOW() - INTERVAL '{$period} days'
            WHERE u.is_active = true
            GROUP BY u.id, u.name, l.id, l.name
            ORDER BY authorized_revenue DESC NULLS LAST
        ");
    }

    private function getDepotComparison(int $period): array
    {
        return DB::select("
            SELECT
              l.name AS depot, l.city,
              COUNT(o.id) AS orders, SUM(o.total) AS revenue,
              COUNT(o.id) FILTER (WHERE o.status = 'AUTHORIZED') AS authorized,
              ROUND(COUNT(o.id) FILTER (WHERE o.status = 'AUTHORIZED')::numeric /
                NULLIF(COUNT(o.id) FILTER (WHERE o.status <> 'DRAFT'), 0) * 100, 1) AS conversion_pct
            FROM orders o
            JOIN users u ON u.id = o.created_by
            JOIN user_locations ul ON ul.user_id = u.id
            JOIN locations l ON l.id = ul.location_id
            WHERE o.is_current = true AND o.deleted_at IS NULL
              AND o.order_date >= NOW() - INTERVAL '{$period} days'
            GROUP BY l.id, l.name, l.city
            ORDER BY revenue DESC
        ");
    }

    private function generateInsights(array $records, array $depot): array
    {
        $insights = [];

        $zeroConversion = array_filter($records, fn($r) => ($r->conversion_pct ?? 0) == 0 && $r->orders_captured > 3);
        if (count($zeroConversion) > 0) {
            $rep = $zeroConversion[array_key_first($zeroConversion)];
            $insights[] = [
                'severity' => 'warning',
                'message' => 'Rep ' . $rep->rep_name . ' has 0% conversion (' . $rep->orders_captured . ' orders) — needs coaching',
                'action' => 'Review orders for pattern or blockers',
            ];
        }

        if (count($records) >= 2) {
            usort($records, fn($a, $b) => ($b->authorized_revenue ?? 0) <=> ($a->authorized_revenue ?? 0));
            $top = $records[0]->authorized_revenue ?? 0;
            $second = $records[1]->authorized_revenue ?? 0;
            if ($top > $second * 3 && $second > 0) {
                $insights[] = [
                    'severity' => 'info',
                    'message' => 'Over-reliance on rep ' . $records[0]->rep_name . ' — ' . number_format($top / ($top + $second) * 100, 0) . '% of revenue',
                    'action' => 'Review territory allocation',
                ];
            }
        }

        if (count($depot) > 0) {
            $avgConversion = array_sum(array_map(fn($d) => $d->conversion_pct ?? 0, $depot)) / count($depot);
            $underperform = array_filter($depot, fn($d) => ($d->conversion_pct ?? 0) < $avgConversion * 0.7);
            if (count($underperform) > 0) {
                $first = $underperform[array_key_first($underperform)];
                $insights[] = [
                    'severity' => 'warning',
                    'message' => 'Depot ' . $first->depot . ' underperforming: ' . round($first->conversion_pct ?? 0, 1) . '% vs ' . round($avgConversion, 1) . '% team avg',
                    'action' => 'Investigate approval bottlenecks at this depot',
                ];
            }
        }

        $inactive = array_filter($records, fn($r) => $r->orders_captured == 0);
        if (count($inactive) > 0) {
            $insights[] = [
                'severity' => 'info',
                'message' => count($inactive) . ' reps captured 0 orders in period',
                'action' => 'Check activity and territory assignments',
            ];
        }

        return $insights;
    }

    private function generateRecommendations(array $records, array $insights): array
    {
        $recs = [];

        if (count($insights) > 0) {
            $recs[] = 'Review rep performance metrics daily';
        }

        if (count($records) > 0) {
            $recs[] = 'Schedule coaching sessions for underperforming reps';
        }

        return $recs;
    }
}
