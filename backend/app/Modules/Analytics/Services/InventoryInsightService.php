<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class InventoryInsightService
{
    public function getInsights(): array
    {
        $kpis = $this->getStockHealth();
        $records = $this->getDaysToDepletion();
        $charts = $this->getCharts();
        $insights = $this->generateInsights($kpis, $records);
        $recommendations = $this->generateRecommendations($kpis, $records, $insights);

        return compact('kpis', 'records', 'charts', 'insights', 'recommendations');
    }

    private function getStockHealth(): array
    {
        $data = DB::selectOne("
            SELECT
              COUNT(*) FILTER (WHERE sl_total > si.reorder_level) AS in_stock,
              COUNT(*) FILTER (WHERE sl_total > 0 AND sl_total <= si.reorder_level) AS low_stock,
              COUNT(*) FILTER (WHERE sl_total = 0 OR sl_total IS NULL) AS out_of_stock,
              SUM(sl_total * si.unit_cost) AS total_stock_value
            FROM stock_items si
            LEFT JOIN (
              SELECT item_id, SUM(quantity) AS sl_total
              FROM stock_ledgers GROUP BY item_id
            ) agg ON agg.item_id = si.id
            WHERE si.is_active = true
        ");

        return [
            'in_stock' => (int) ($data->in_stock ?? 0),
            'low_stock' => (int) ($data->low_stock ?? 0),
            'out_of_stock' => (int) ($data->out_of_stock ?? 0),
            'total_value' => (float) ($data->total_stock_value ?? 0),
        ];
    }

    private function getDaysToDepletion(): array
    {
        return DB::select("
            SELECT
              si.id, si.name, si.sku, si.unit, si.reorder_level, si.unit_cost,
              COALESCE(bal.total_qty, 0) AS current_stock,
              COALESCE(mov.daily_consumption, 0) AS daily_consumption,
              CASE
                WHEN COALESCE(mov.daily_consumption, 0) = 0 THEN NULL
                ELSE FLOOR(COALESCE(bal.total_qty, 0) / mov.daily_consumption)
              END AS days_to_depletion,
              CASE
                WHEN COALESCE(bal.total_qty, 0) = 0 THEN 'out_of_stock'
                WHEN COALESCE(bal.total_qty, 0) <= si.reorder_level THEN 'low_stock'
                ELSE 'in_stock'
              END AS stock_status,
              COALESCE(bal.total_qty, 0) * si.unit_cost AS stock_value
            FROM stock_items si
            LEFT JOIN (
              SELECT item_id, SUM(quantity) AS total_qty FROM stock_ledgers GROUP BY item_id
            ) bal ON bal.item_id = si.id
            LEFT JOIN (
              SELECT item_id,
                     SUM(quantity) FILTER (WHERE type IN ('remove','sales')) / 30.0 AS daily_consumption
              FROM stock_journals
              WHERE created_at >= NOW() - INTERVAL '30 days'
                AND type IN ('remove','sales')
              GROUP BY item_id
            ) mov ON mov.item_id = si.id
            WHERE si.is_active = true
            ORDER BY days_to_depletion ASC NULLS LAST
            LIMIT 50
        ");
    }

    private function getCharts(): array
    {
        $byLocation = DB::select("
            SELECT l.name AS depot, SUM(sl.quantity * si.unit_cost) AS stock_value,
                   COUNT(DISTINCT sl.item_id) AS item_count
            FROM stock_ledgers sl
            JOIN locations l ON l.id = sl.location_id
            JOIN stock_items si ON si.id = sl.item_id
            GROUP BY l.id, l.name ORDER BY stock_value DESC
        ");

        return [
            'by_location' => array_map(fn($row) => [
                'depot' => $row->depot,
                'value' => (float) $row->stock_value,
            ], $byLocation),
        ];
    }

    private function generateInsights(array $kpis, array $records): array
    {
        $insights = [];

        if ($kpis['out_of_stock'] > 0) {
            $insights[] = [
                'severity' => 'critical',
                'message' => $kpis['out_of_stock'] . ' items completely out of stock',
                'action' => 'Raise stock journal add entries immediately',
            ];
        }

        $critical = array_filter($records, fn($r) => $r->days_to_depletion !== null && $r->days_to_depletion <= 7);
        if (count($critical) > 0) {
            $insights[] = [
                'severity' => 'critical',
                'message' => count($critical) . ' items will run out in ≤7 days',
                'action' => 'Reorder these items now',
            ];
        }

        $warning = array_filter($records, fn($r) => $r->days_to_depletion !== null && $r->days_to_depletion > 7 && $r->days_to_depletion <= 14);
        if (count($warning) > 0) {
            $insights[] = [
                'severity' => 'warning',
                'message' => count($warning) . ' items stock will last 8-14 days',
                'action' => 'Schedule reorders this week',
            ];
        }

        if ($kpis['low_stock'] > 5) {
            $insights[] = [
                'severity' => 'warning',
                'message' => $kpis['low_stock'] . ' items below reorder level',
                'action' => 'Review reorder policy',
            ];
        }

        return $insights;
    }

    private function generateRecommendations(array $kpis, array $records, array $insights): array
    {
        $recs = [];

        if (count($insights) > 0) {
            $recs[] = 'Check daily stock levels against reorder thresholds';
        }

        if ($kpis['out_of_stock'] > 0) {
            $recs[] = 'Investigate why items are zero-balance — data gap or true stock-out?';
        }

        return $recs;
    }
}
