<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class RevenueIntelligenceService
{
    public function getInsights(): array
    {
        return [
            'by_product' => $this->revenueByProduct(),
            'by_region' => $this->revenueByRegion(),
            'by_officer' => $this->revenueBySalesOfficer(),
            'growth_trends' => $this->growthTrends(),
            'margins' => $this->profitMargins(),
            'top_products' => $this->topPerformingProducts(),
            'declining_products' => $this->decliningProducts(),
            'leakage' => $this->detectLeakage(),
            'forecast' => $this->forecastRevenue(),
            'recommendations' => $this->generateRecommendations(),
        ];
    }

    private function revenueByProduct(): array
    {
        return DB::select("
            SELECT si.name, si.sku,
                SUM(oi.quantity*oi.unit_price) AS revenue,
                COUNT(DISTINCT o.id) AS orders,
                SUM(oi.quantity) AS units_sold
            FROM order_items oi
            JOIN stock_items si ON si.id=oi.item_id
            JOIN orders o ON o.id=oi.order_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY si.id, si.name, si.sku
            ORDER BY revenue DESC
        ");
    }

    private function revenueByRegion(): array
    {
        return DB::select("
            SELECT l.name AS region,
                SUM(o.total) AS revenue,
                COUNT(DISTINCT o.id) AS orders,
                AVG(o.total) AS avg_order_value,
                COUNT(DISTINCT c.id) AS customers
            FROM orders o
            JOIN customers c ON c.id=o.customer_id
            JOIN locations l ON l.id=c.location_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY l.id, l.name
            ORDER BY revenue DESC
        ");
    }

    private function revenueBySalesOfficer(): array
    {
        return DB::select("
            SELECT u.name AS officer,
                SUM(o.total) AS revenue,
                COUNT(DISTINCT o.id) AS orders,
                COUNT(DISTINCT c.id) AS customers,
                AVG(o.total) AS avg_order_value,
                (COUNT(DISTINCT o.id)::float/COUNT(DISTINCT c.id))*100 AS conversion_rate
            FROM orders o
            JOIN users u ON u.id=o.created_by
            JOIN customers c ON c.id=o.customer_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY u.id, u.name
            ORDER BY revenue DESC
        ");
    }

    private function growthTrends(): array
    {
        return DB::select("
            SELECT DATE_TRUNC('week', o.order_date)::date AS week,
                SUM(o.total) FILTER (WHERE o.status='AUTHORIZED') AS revenue,
                LAG(SUM(o.total)) OVER (ORDER BY DATE_TRUNC('week', o.order_date)) AS prev_revenue,
                ROUND(((SUM(o.total)-LAG(SUM(o.total)) OVER (ORDER BY DATE_TRUNC('week', o.order_date)))/
                  LAG(SUM(o.total)) OVER (ORDER BY DATE_TRUNC('week', o.order_date))*100)::numeric, 1) AS growth_pct
            FROM orders o
            WHERE o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY 1
            ORDER BY 1
        ");
    }

    private function profitMargins(): array
    {
        return DB::select("
            SELECT si.name, si.sku,
                SUM(oi.quantity*oi.unit_price) AS revenue,
                SUM(oi.quantity*(si.unit_cost)) AS cogs,
                ROUND(((SUM(oi.quantity*oi.unit_price)-SUM(oi.quantity*si.unit_cost))/SUM(oi.quantity*oi.unit_price)*100)::numeric, 1) AS margin_pct
            FROM order_items oi
            JOIN stock_items si ON si.id=oi.item_id
            JOIN orders o ON o.id=oi.order_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY si.id, si.name, si.sku
            ORDER BY margin_pct DESC
        ");
    }

    private function topPerformingProducts(): array
    {
        $data = DB::select("
            SELECT si.name, si.sku, SUM(oi.quantity*oi.unit_price) AS revenue
            FROM order_items oi
            JOIN stock_items si ON si.id=oi.item_id
            JOIN orders o ON o.id=oi.order_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY si.id, si.name, si.sku
            ORDER BY revenue DESC LIMIT 10
        ");
        return array_map(fn($p) => [
            'name' => $p->name, 'sku' => $p->sku, 'revenue' => (float)$p->revenue,
            'recommendation' => 'Increase stock and marketing focus'
        ], $data);
    }

    private function decliningProducts(): array
    {
        $data = DB::select("
            SELECT si.name, si.sku,
                SUM(CASE WHEN o.order_date >= NOW()-INTERVAL '45 days' THEN oi.quantity*oi.unit_price ELSE 0 END) AS recent,
                SUM(CASE WHEN o.order_date < NOW()-INTERVAL '45 days' AND o.order_date >= NOW()-INTERVAL '90 days' THEN oi.quantity*oi.unit_price ELSE 0 END) AS prior
            FROM order_items oi
            JOIN stock_items si ON si.id=oi.item_id
            JOIN orders o ON o.id=oi.order_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY si.id, si.name, si.sku
            HAVING SUM(CASE WHEN o.order_date >= NOW()-INTERVAL '45 days' THEN oi.quantity*oi.unit_price ELSE 0 END) <
                   SUM(CASE WHEN o.order_date < NOW()-INTERVAL '45 days' AND o.order_date >= NOW()-INTERVAL '90 days' THEN oi.quantity*oi.unit_price ELSE 0 END)*0.8
            ORDER BY recent DESC
        ");
        return array_map(fn($p) => [
            'name' => $p->name, 'sku' => $p->sku, 'recent' => (float)$p->recent, 'prior' => (float)$p->prior,
            'decline_pct' => round(((float)$p->recent-(float)$p->prior)/(float)$p->prior*100, 1),
            'action' => 'Discount, bundle, or discontinue'
        ], $data);
    }

    private function detectLeakage(): array
    {
        $leakage = [];
        $highDiscounts = DB::selectOne("
            SELECT COUNT(*) as cnt, SUM(oi.discount) as total FROM order_items oi
            WHERE oi.discount > 0 AND oi.order_id IN (
                SELECT id FROM orders WHERE status='AUTHORIZED' AND order_date >= NOW()-INTERVAL '30 days'
            )
        ");
        if ($highDiscounts->total > 0) {
            $leakage[] = ['type' => 'Excessive Discounting', 'amount' => (float)$highDiscounts->total, 'impact' => 'Reduce to improve margins'];
        }

        $returnedItems = DB::selectOne("
            SELECT SUM(total) as total FROM invoices
            WHERE status='cancelled' AND deleted_at IS NULL
              AND created_at >= NOW()-INTERVAL '30 days'
        ");
        if ($returnedItems->total > 0) {
            $leakage[] = ['type' => 'Returns/Cancellations', 'amount' => (float)$returnedItems->total, 'impact' => 'Investigate root cause'];
        }

        return $leakage;
    }

    private function forecastRevenue(): array
    {
        $trend = DB::select("
            SELECT DATE_TRUNC('day', o.order_date)::date AS date, SUM(o.total) AS revenue
            FROM orders o
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '30 days'
            GROUP BY 1 ORDER BY 1
        ");

        $points = array_map(fn($i, $r) => [$i, (float)$r->revenue], array_keys($trend), $trend);
        $reg = $this->linearRegression($points);

        return [
            'next_7d' => max(0, array_sum(array_map(fn($i) => max(0, $reg['slope']*(count($points)+$i)+$reg['intercept']), range(1, 7)))),
            'next_30d' => max(0, array_sum(array_map(fn($i) => max(0, $reg['slope']*(count($points)+$i)+$reg['intercept']), range(1, 30)))),
        ];
    }

    private function linearRegression(array $points): array
    {
        $n = count($points);
        if ($n < 2) return ['slope' => 0, 'intercept' => 0];
        $sumX = $sumY = $sumXY = $sumX2 = 0;
        foreach ($points as [$x, $y]) {
            $sumX += $x; $sumY += $y; $sumXY += $x*$y; $sumX2 += $x*$x;
        }
        $denom = $n*$sumX2-$sumX**2;
        if ($denom == 0) return ['slope' => 0, 'intercept' => $sumY/$n];
        return ['slope' => ($n*$sumXY-$sumX*$sumY)/$denom, 'intercept' => ($sumY-($n*$sumXY-$sumX*$sumY)/$denom*$sumX)/$n];
    }

    private function generateRecommendations(): array
    {
        $recs = [];
        $topProduct = DB::selectOne("
            SELECT si.name, SUM(oi.quantity*oi.unit_price) as rev FROM order_items oi
            JOIN stock_items si ON si.id=oi.item_id
            JOIN orders o ON o.id=oi.order_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY si.id, si.name ORDER BY rev DESC LIMIT 1
        ");
        if ($topProduct) $recs[] = "Push '{$topProduct->name}' — top performer";

        $weakRegion = DB::selectOne("
            SELECT l.name, SUM(o.total) as rev FROM orders o
            JOIN customers c ON c.id=o.customer_id
            JOIN locations l ON l.id=c.location_id
            WHERE o.status='AUTHORIZED' AND o.is_current=true AND o.deleted_at IS NULL
              AND o.order_date >= NOW()-INTERVAL '90 days'
            GROUP BY l.id, l.name ORDER BY rev ASC LIMIT 1
        ");
        if ($weakRegion) $recs[] = "Focus attention on {$weakRegion->name} region";

        return $recs;
    }
}
