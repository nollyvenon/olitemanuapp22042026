<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class ExecutiveDashboardService
{
    public function getInsights(): array
    {
        $kpis = $this->getKpis();
        $trend = $this->getRevenueTrend();
        $cashflow = $this->getCashFlow();
        $aging = $this->getArAging();
        $inventory = $this->getInventoryHealth();
        $forecast = $this->getForecast($trend);
        $anomalies = $this->detectAnomalies($kpis, $trend);
        $risks = $this->generateRisks($kpis, $aging, $inventory);

        return compact('kpis', 'trend', 'cashflow', 'aging', 'inventory', 'forecast', 'anomalies', 'risks');
    }

    private function getKpis(): array
    {
        $data = DB::selectOne("
            SELECT
              SUM(total) FILTER (WHERE status='AUTHORIZED'
                AND order_date >= NOW()-INTERVAL '30 days') AS rev_current,
              SUM(total) FILTER (WHERE status='AUTHORIZED'
                AND order_date >= NOW()-INTERVAL '60 days'
                AND order_date < NOW()-INTERVAL '30 days') AS rev_prior,
              SUM(total) FILTER (WHERE status='AUTHORIZED'
                AND order_date >= NOW()-INTERVAL '7 days') AS rev_7d,
              SUM(total) FILTER (WHERE status='AUTHORIZED'
                AND order_date >= NOW()-INTERVAL '14 days'
                AND order_date < NOW()-INTERVAL '7 days') AS rev_prior_7d,
              COUNT(*) FILTER (WHERE status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','PENDING_AUTH')) AS pipeline_count,
              SUM(total) FILTER (WHERE status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','PENDING_AUTH')) AS pipeline_value
            FROM orders WHERE is_current=true AND deleted_at IS NULL
        ");

        $revCurrent = (float) ($data->rev_current ?? 0);
        $revPrior = (float) ($data->rev_prior ?? 0);
        $revChangePct = $revPrior > 0 ? (($revCurrent - $revPrior) / $revPrior) * 100 : 0;

        $outstandingData = DB::selectOne("
            SELECT SUM(total) AS total_outstanding FROM invoices
            WHERE status NOT IN ('paid','cancelled') AND deleted_at IS NULL
        ");

        $inventoryData = DB::selectOne("
            SELECT
              COUNT(*) FILTER (WHERE sl_total=0 OR sl_total IS NULL) AS out_of_stock,
              COUNT(*) FILTER (WHERE sl_total>0 AND sl_total<=si.reorder_level) AS low_stock,
              SUM(sl_total*si.unit_cost) AS stock_value
            FROM stock_items si
            LEFT JOIN (SELECT item_id, SUM(quantity) AS sl_total FROM stock_ledgers GROUP BY item_id) agg
              ON agg.item_id=si.id
            WHERE si.is_active=true
        ");

        return [
            'rev_current' => $revCurrent,
            'rev_prior' => $revPrior,
            'rev_change_pct' => $revChangePct,
            'rev_7d' => (float) ($data->rev_7d ?? 0),
            'rev_prior_7d' => (float) ($data->rev_prior_7d ?? 0),
            'pipeline_value' => (float) ($data->pipeline_value ?? 0),
            'pipeline_count' => (int) ($data->pipeline_count ?? 0),
            'total_outstanding' => (float) ($outstandingData->total_outstanding ?? 0),
            'stock_value' => (float) ($inventoryData->stock_value ?? 0),
            'out_of_stock' => (int) ($inventoryData->out_of_stock ?? 0),
            'low_stock' => (int) ($inventoryData->low_stock ?? 0),
        ];
    }

    private function getRevenueTrend(): array
    {
        return DB::select("
            SELECT DATE_TRUNC('day', order_date)::date AS date,
                   SUM(total) AS revenue, COUNT(*) AS orders
            FROM orders
            WHERE status='AUTHORIZED' AND is_current=true AND deleted_at IS NULL
              AND order_date >= NOW()-INTERVAL '37 days'
            GROUP BY 1 ORDER BY 1
        ");
    }

    private function getCashFlow(): array
    {
        return DB::select("
            SELECT DATE_TRUNC('week', transaction_date)::date AS week,
              SUM(amount) FILTER (WHERE type='receipt') AS collected,
              SUM(amount) FILTER (WHERE type='debit_note') AS charged
            FROM vouchers WHERE status='posted'
              AND transaction_date >= NOW()-INTERVAL '90 days'
            GROUP BY 1 ORDER BY 1
        ");
    }

    private function getArAging(): array
    {
        $data = DB::selectOne("
            SELECT
              SUM(total) FILTER (WHERE due_date >= CURRENT_DATE) AS current_val,
              SUM(total) FILTER (WHERE CURRENT_DATE-due_date::date BETWEEN 1 AND 30) AS d30_val,
              SUM(total) FILTER (WHERE CURRENT_DATE-due_date::date BETWEEN 31 AND 60) AS d60_val,
              SUM(total) FILTER (WHERE CURRENT_DATE-due_date::date BETWEEN 61 AND 90) AS d90_val,
              SUM(total) FILTER (WHERE CURRENT_DATE-due_date::date > 90) AS d90plus_val
            FROM invoices WHERE status NOT IN ('paid','cancelled') AND deleted_at IS NULL
        ");

        return [
            'current' => (float) ($data->current_val ?? 0),
            'd30' => (float) ($data->d30_val ?? 0),
            'd60' => (float) ($data->d60_val ?? 0),
            'd90' => (float) ($data->d90_val ?? 0),
            'd90plus' => (float) ($data->d90plus_val ?? 0),
        ];
    }

    private function getInventoryHealth(): array
    {
        $data = DB::selectOne("
            SELECT
              COUNT(*) FILTER (WHERE sl_total=0 OR sl_total IS NULL) AS out_of_stock,
              COUNT(*) FILTER (WHERE sl_total>0 AND sl_total<=si.reorder_level) AS low_stock,
              COUNT(*) FILTER (WHERE sl_total>si.reorder_level) AS in_stock
            FROM stock_items si
            LEFT JOIN (SELECT item_id, SUM(quantity) AS sl_total FROM stock_ledgers GROUP BY item_id) agg
              ON agg.item_id=si.id
            WHERE si.is_active=true
        ");

        return [
            'out_of_stock' => (int) ($data->out_of_stock ?? 0),
            'low_stock' => (int) ($data->low_stock ?? 0),
            'in_stock' => (int) ($data->in_stock ?? 0),
        ];
    }

    private function getForecast(array $trend): array
    {
        $points = array_map(fn($i, $row) => [$i, (float) $row->revenue], array_keys($trend), $trend);
        $reg = $this->linearRegression($points);
        $next7d = 0;
        $next30d = 0;
        if (count($trend) > 0) {
            for ($i = 1; $i <= 7; $i++) {
                $next7d += max(0, $reg['slope'] * (count($points) + $i) + $reg['intercept']);
            }
            for ($i = 1; $i <= 30; $i++) {
                $next30d += max(0, $reg['slope'] * (count($points) + $i) + $reg['intercept']);
            }
        }
        return ['next_7d' => (float) $next7d, 'next_30d' => (float) $next30d];
    }

    private function linearRegression(array $points): array
    {
        $n = count($points);
        if ($n < 2) return ['slope' => 0, 'intercept' => 0];
        $sumX = $sumY = $sumXY = $sumX2 = 0;
        foreach ($points as [$x, $y]) {
            $sumX += $x;
            $sumY += $y;
            $sumXY += $x * $y;
            $sumX2 += $x * $x;
        }
        $denom = $n * $sumX2 - $sumX ** 2;
        if ($denom == 0) return ['slope' => 0, 'intercept' => $sumY / $n];
        $m = ($n * $sumXY - $sumX * $sumY) / $denom;
        $b = ($sumY - $m * $sumX) / $n;
        return ['slope' => $m, 'intercept' => $b];
    }

    private function detectAnomalies(array $kpis, array $trend): array
    {
        $anomalies = [];

        $rev7d = $kpis['rev_7d'];
        $revPrior7d = $kpis['rev_prior_7d'];
        if ($revPrior7d > 0 && $rev7d < $revPrior7d * 0.80) {
            $anomalies[] = [
                'severity' => 'critical',
                'message' => 'Revenue down ' . round((1 - $rev7d / $revPrior7d) * 100) . '% this week vs last week',
                'action' => 'Review stalled pipeline immediately',
            ];
        }

        if ($revPrior7d > 0 && $rev7d > $revPrior7d * 1.30) {
            $anomalies[] = [
                'severity' => 'info',
                'message' => 'Revenue spike +' . round(($rev7d / $revPrior7d - 1) * 100) . '% this week',
                'action' => 'Verify data accuracy',
            ];
        }

        if ($kpis['out_of_stock'] > 5) {
            $anomalies[] = [
                'severity' => 'critical',
                'message' => $kpis['out_of_stock'] . ' items completely out of stock',
                'action' => 'Raise stock add entries immediately',
            ];
        }

        return $anomalies;
    }

    private function generateRisks(array $kpis, array $aging, array $inventory): array
    {
        $risks = [];

        $totalAging = array_sum($aging);
        if ($totalAging > 0 && $aging['d90plus'] > $totalAging * 0.2) {
            $risks[] = '90+ day overdue exceeds 20% of total AR — bad debt risk';
        }

        if ($inventory['out_of_stock'] > 0) {
            $risks[] = $inventory['out_of_stock'] . ' critical stock-outs — revenue impact imminent';
        }

        if ($kpis['pipeline_value'] < $kpis['rev_current'] * 0.3) {
            $risks[] = 'Pipeline value < 30% of monthly revenue — capacity gap in next 30 days';
        }

        return $risks;
    }
}
