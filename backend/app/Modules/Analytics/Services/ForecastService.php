<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class ForecastService
{
    public function getSalesForecasts(): array
    {
        $history = DB::select("
            SELECT DATE_TRUNC('day', order_date)::date as date, SUM(total) as revenue
            FROM orders WHERE status='AUTHORIZED' AND is_current=true AND deleted_at IS NULL
              AND order_date >= NOW() - INTERVAL '90 days'
            GROUP BY 1 ORDER BY 1
        ");
        return [
            'historical' => $history,
            'forecast_7d' => $this->forecast($history, 7),
            'forecast_30d' => $this->forecast($history, 30),
            'forecast_90d' => $this->forecast($history, 90),
            'model' => 'linear_regression'
        ];
    }

    public function getInventoryForecasts(): array
    {
        $history = DB::select("
            SELECT DATE_TRUNC('day', created_at)::date as date, SUM(CASE WHEN type='remove' THEN quantity ELSE 0 END) as outflow
            FROM stock_journals WHERE created_at >= NOW() - INTERVAL '90 days'
            GROUP BY 1 ORDER BY 1
        ");
        $items_at_risk = DB::select("
            SELECT si.id, si.name, COALESCE(sl.quantity, 0) as current_qty, si.reorder_level,
              ROUND(COALESCE(sl.quantity, 0) / NULLIF((SELECT AVG(daily) FROM (SELECT SUM(CASE WHEN type='remove' THEN quantity ELSE 0 END) as daily FROM stock_journals WHERE item_id=si.id AND created_at >= NOW()-INTERVAL '30 days' GROUP BY DATE_TRUNC('day',created_at)) x), 0)) as days_until_stockout
            FROM stock_items si
            LEFT JOIN (SELECT item_id, SUM(quantity) as quantity FROM stock_ledgers GROUP BY item_id) sl ON sl.item_id=si.id
            WHERE si.is_active=true AND COALESCE(sl.quantity, 0) <= si.reorder_level * 1.5
            ORDER BY days_until_stockout ASC LIMIT 10
        ");
        return [
            'historical' => $history,
            'forecast_7d' => $this->forecast($history, 7, 'outflow'),
            'forecast_30d' => $this->forecast($history, 30, 'outflow'),
            'stockout_risk' => $items_at_risk,
            'model' => 'linear_regression'
        ];
    }

    public function getCashFlowForecasts(): array
    {
        $inflow = DB::select("
            SELECT DATE_TRUNC('week', transaction_date)::date as week, SUM(amount) as collected
            FROM vouchers WHERE type='receipt' AND status='posted' AND transaction_date >= NOW() - INTERVAL '90 days'
            GROUP BY 1 ORDER BY 1
        ");
        $outflow = DB::select("
            SELECT DATE_TRUNC('week', due_date)::date as week, SUM(amount) as due
            FROM vouchers WHERE type='debit_note' AND status='posted' AND due_date >= NOW() - INTERVAL '90 days'
            GROUP BY 1 ORDER BY 1
        ");
        return [
            'inflow_historical' => $inflow,
            'outflow_historical' => $outflow,
            'inflow_forecast_4w' => $this->forecast($inflow, 4, 'collected'),
            'outflow_forecast_4w' => $this->forecast($outflow, 4, 'due'),
            'net_position_30d' => $this->netCashPosition(),
            'model' => 'linear_regression'
        ];
    }

    private function forecast(array $history, int $periods, string $key = 'revenue'): array
    {
        if (count($history) < 2) return [];
        $points = array_map(fn($i, $r) => [$i, (float)($r->{$key} ?? 0)], array_keys($history), $history);
        $reg = $this->regression($points);
        $projected = [];
        $lastX = count($history);
        for ($i = 1; $i <= $periods; $i++) {
            $projected[] = ['day' => $lastX + $i, 'forecast' => max(0, $reg['m'] * ($lastX + $i) + $reg['b'])];
        }
        return $projected;
    }

    private function regression(array $points): array
    {
        $n = count($points);
        if ($n < 2) return ['m' => 0, 'b' => 0];
        $sumX = $sumY = $sumXY = $sumX2 = 0;
        foreach ($points as [$x, $y]) {
            $sumX += $x; $sumY += $y;
            $sumXY += $x * $y; $sumX2 += $x * $x;
        }
        $m = ($n * $sumXY - $sumX * $sumY) / max(1, $n * $sumX2 - $sumX ** 2);
        $b = ($sumY - $m * $sumX) / $n;
        return ['m' => $m, 'b' => $b];
    }

    private function netCashPosition(): array
    {
        return DB::select("
            SELECT DATE_TRUNC('week', CURRENT_DATE)::date as week,
              (SELECT SUM(amount) FROM vouchers WHERE type='receipt' AND status='posted' AND transaction_date >= NOW()-INTERVAL '30 days') as collected_30d,
              (SELECT SUM(amount) FROM vouchers WHERE type='debit_note' AND status='posted' AND due_date >= NOW()-INTERVAL '30 days') as due_30d,
              (SELECT SUM(amount) FROM vouchers WHERE type='receipt' AND status='posted' AND transaction_date >= NOW()-INTERVAL '30 days') -
              (SELECT SUM(amount) FROM vouchers WHERE type='debit_note' AND status='posted' AND due_date >= NOW()-INTERVAL '30 days') as net_position
        ") ?? [];
    }
}
