<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class InventoryIntelligenceService
{
    public function getInsights(): array
    {
        return [
            'stock_levels' => $this->stockLevels(),
            'movement_trends' => $this->movementTrends(),
            'turnover_rates' => $this->turnoverRates(),
            'dead_stock' => $this->detectDeadStock(),
            'fast_moving' => $this->fastMovingItems(),
            'stockout_forecast' => $this->predictStockouts(),
            'reorder_recommendations' => $this->reorderRecommendations(),
            'redistribution' => $this->redistributionSuggestions(),
            'low_stock_alerts' => $this->lowStockAlerts(),
            'excess_stock_alerts' => $this->excessStockAlerts(),
        ];
    }

    private function stockLevels(): array
    {
        return DB::select("
            SELECT si.id, si.name, si.sku, si.reorder_level, si.unit_cost,
                COALESCE(SUM(sl.quantity), 0) AS current_stock,
                si.reorder_level * 1.5 AS optimal_stock,
                COALESCE(SUM(sl.quantity), 0) * si.unit_cost AS stock_value
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            WHERE si.is_active = true
            GROUP BY si.id, si.name, si.sku, si.reorder_level, si.unit_cost
            ORDER BY stock_value DESC
        ");
    }

    private function movementTrends(): array
    {
        return DB::select("
            SELECT DATE_TRUNC('week', sj.created_at)::date AS week, si.name, si.sku,
                SUM(CASE WHEN sj.type='add' THEN sj.quantity ELSE 0 END) AS inward,
                SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END) AS outward,
                SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END) -
                SUM(CASE WHEN sj.type='add' THEN sj.quantity ELSE 0 END) AS net_movement
            FROM stock_journals sj
            JOIN stock_items si ON si.id = sj.item_id
            WHERE sj.created_at >= NOW() - INTERVAL '90 days'
            GROUP BY 1, si.id, si.name, si.sku
            ORDER BY 1 DESC
        ");
    }

    private function turnoverRates(): array
    {
        return DB::select("
            SELECT si.id, si.name, si.sku,
                COALESCE(SUM(sl.quantity), 0) AS current_stock,
                COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0) AS units_sold_90d,
                ROUND((COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0)::float /
                  NULLIF(COALESCE(SUM(sl.quantity), 0), 0) / 0.25), 2) AS annual_turnover
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            LEFT JOIN stock_journals sj ON sj.item_id = si.id AND sj.created_at >= NOW() - INTERVAL '90 days' AND sj.type='remove'
            WHERE si.is_active = true
            GROUP BY si.id, si.name, si.sku
            ORDER BY annual_turnover DESC NULLS LAST
        ");
    }

    private function detectDeadStock(): array
    {
        $data = DB::select("
            SELECT si.id, si.name, si.sku,
                COALESCE(SUM(sl.quantity), 0) AS current_stock,
                si.unit_cost,
                COALESCE(SUM(sl.quantity), 0) * si.unit_cost AS locked_value,
                EXTRACT(DAY FROM NOW() - MAX(sj.created_at)) AS days_since_movement
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            LEFT JOIN stock_journals sj ON sj.item_id = si.id
            WHERE si.is_active = true AND COALESCE(SUM(sl.quantity), 0) > 0
            GROUP BY si.id, si.name, si.sku, si.unit_cost
            HAVING EXTRACT(DAY FROM NOW() - MAX(sj.created_at)) > 90
              OR MAX(sj.created_at) IS NULL
            ORDER BY locked_value DESC
        ");
        return array_map(fn($i) => [
            'id' => $i->id, 'name' => $i->name, 'sku' => $i->sku, 'stock' => (int)$i->current_stock,
            'locked_value' => (float)$i->locked_value, 'days_inactive' => (int)($i->days_since_movement ?? 999),
            'action' => 'Liquidate or discontinue'
        ], $data);
    }

    private function fastMovingItems(): array
    {
        $data = DB::select("
            SELECT si.id, si.name, si.sku,
                COALESCE(SUM(sl.quantity), 0) AS current_stock,
                COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0) AS units_sold_90d,
                ROUND(COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0)::float / 90, 2) AS daily_sales
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            LEFT JOIN stock_journals sj ON sj.item_id = si.id AND sj.created_at >= NOW() - INTERVAL '90 days'
            WHERE si.is_active = true
            GROUP BY si.id, si.name, si.sku
            HAVING COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0) > 0
              AND COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0) >= 50
            ORDER BY units_sold_90d DESC
        ");
        return array_map(fn($i) => [
            'id' => $i->id, 'name' => $i->name, 'sku' => $i->sku, 'stock' => (int)$i->current_stock,
            'sold_90d' => (int)$i->units_sold_90d, 'daily_rate' => (float)$i->daily_sales,
            'recommendation' => 'Increase stock allocation'
        ], $data);
    }

    private function predictStockouts(): array
    {
        $predictions = [];
        $fastMoving = DB::select("
            SELECT si.id, si.name, si.sku,
                COALESCE(SUM(sl.quantity), 0) AS current_stock,
                ROUND(COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0)::float / 90, 2) AS daily_rate
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            LEFT JOIN stock_journals sj ON sj.item_id = si.id AND sj.created_at >= NOW() - INTERVAL '90 days'
            WHERE si.is_active = true AND COALESCE(SUM(sl.quantity), 0) > 0
              AND COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0) > 0
            GROUP BY si.id, si.name, si.sku
        ");
        foreach ($fastMoving as $item) {
            if ((float)$item->daily_rate > 0) {
                $days_remaining = ceil((int)$item->current_stock / (float)$item->daily_rate);
                if ($days_remaining < 30) {
                    $predictions[] = [
                        'id' => $item->id, 'name' => $item->name, 'sku' => $item->sku,
                        'current_stock' => (int)$item->current_stock, 'daily_rate' => (float)$item->daily_rate,
                        'days_until_stockout' => $days_remaining,
                        'urgency' => $days_remaining < 7 ? 'critical' : 'warning'
                    ];
                }
            }
        }
        return $predictions;
    }

    private function reorderRecommendations(): array
    {
        $recs = [];
        $items = DB::select("
            SELECT si.id, si.name, si.sku, si.reorder_level,
                COALESCE(SUM(sl.quantity), 0) AS current_stock,
                ROUND(COALESCE(SUM(CASE WHEN sj.type='remove' THEN sj.quantity ELSE 0 END), 0)::float / 90, 2) AS daily_rate
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            LEFT JOIN stock_journals sj ON sj.item_id = si.id AND sj.created_at >= NOW() - INTERVAL '90 days'
            WHERE si.is_active = true AND si.reorder_level > 0
            GROUP BY si.id, si.name, si.sku, si.reorder_level
        ");
        foreach ($items as $item) {
            $lead_time = 14;
            $safety_stock = (int)$item->reorder_level / 2;
            $eoq = ceil(sqrt(2 * (int)$item->current_stock * 50 / 5));
            $reorder_point = max($safety_stock, (int)((float)$item->daily_rate * $lead_time));
            if ((int)$item->current_stock <= $reorder_point) {
                $recs[] = [
                    'id' => $item->id, 'name' => $item->name, 'sku' => $item->sku,
                    'current_stock' => (int)$item->current_stock, 'reorder_point' => $reorder_point,
                    'recommended_qty' => max($eoq, (int)$item->reorder_level),
                    'priority' => (int)$item->current_stock < $reorder_point ? 'urgent' : 'normal'
                ];
            }
        }
        return $recs;
    }

    private function redistributionSuggestions(): array
    {
        $suggestions = [];
        $locations = DB::select("
            SELECT l.id, l.name,
                SUM(COALESCE(sl.quantity, 0)) AS total_stock,
                COUNT(DISTINCT si.id) AS item_count
            FROM locations l
            LEFT JOIN stock_ledgers sl ON sl.location_id = l.id
            LEFT JOIN stock_items si ON si.id = sl.item_id
            GROUP BY l.id, l.name
        ");
        $high_stock = collect($locations)->sortByDesc('total_stock')->first();
        $low_stock = collect($locations)->sortBy('total_stock')->first();
        if ($high_stock && $low_stock && (int)$high_stock->total_stock > (int)$low_stock->total_stock * 3) {
            $suggestions[] = [
                'from' => $high_stock->name, 'to' => $low_stock->name,
                'reason' => 'Rebalance stock distribution'
            ];
        }
        return $suggestions;
    }

    private function lowStockAlerts(): array
    {
        return DB::select("
            SELECT si.id, si.name, si.sku, si.reorder_level,
                COALESCE(SUM(sl.quantity), 0) AS current_stock
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            WHERE si.is_active = true AND COALESCE(SUM(sl.quantity), 0) < si.reorder_level
            GROUP BY si.id, si.name, si.sku, si.reorder_level
            ORDER BY current_stock ASC
        ");
    }

    private function excessStockAlerts(): array
    {
        return DB::select("
            SELECT si.id, si.name, si.sku, si.reorder_level, si.unit_cost,
                COALESCE(SUM(sl.quantity), 0) AS current_stock,
                COALESCE(SUM(sl.quantity), 0) * si.unit_cost AS stock_value
            FROM stock_items si
            LEFT JOIN stock_ledgers sl ON sl.item_id = si.id
            WHERE si.is_active = true AND COALESCE(SUM(sl.quantity), 0) > si.reorder_level * 3
            GROUP BY si.id, si.name, si.sku, si.reorder_level, si.unit_cost
            ORDER BY stock_value DESC
        ");
    }
}
