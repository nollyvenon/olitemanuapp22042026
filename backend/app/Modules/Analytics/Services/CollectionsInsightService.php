<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class CollectionsInsightService
{
    public function getInsights(): array
    {
        $kpis = $this->getAgingBuckets();
        $records = $this->getAtRiskCustomers();
        $charts = $this->getCharts();
        $insights = $this->generateInsights($kpis, $records);
        $recommendations = $this->generateRecommendations($insights);

        return compact('kpis', 'records', 'charts', 'insights', 'recommendations');
    }

    private function getAgingBuckets(): array
    {
        $data = DB::selectOne("
            SELECT
              COUNT(*) FILTER (WHERE due_date >= CURRENT_DATE) AS current_count,
              SUM(total) FILTER (WHERE due_date >= CURRENT_DATE) AS current_value,
              COUNT(*) FILTER (WHERE CURRENT_DATE - due_date::date BETWEEN 1 AND 30) AS d30_count,
              SUM(total) FILTER (WHERE CURRENT_DATE - due_date::date BETWEEN 1 AND 30) AS d30_value,
              COUNT(*) FILTER (WHERE CURRENT_DATE - due_date::date BETWEEN 31 AND 60) AS d60_count,
              SUM(total) FILTER (WHERE CURRENT_DATE - due_date::date BETWEEN 31 AND 60) AS d60_value,
              COUNT(*) FILTER (WHERE CURRENT_DATE - due_date::date BETWEEN 61 AND 90) AS d90_count,
              SUM(total) FILTER (WHERE CURRENT_DATE - due_date::date BETWEEN 61 AND 90) AS d90_value,
              COUNT(*) FILTER (WHERE CURRENT_DATE - due_date::date > 90) AS d90plus_count,
              SUM(total) FILTER (WHERE CURRENT_DATE - due_date::date > 90) AS d90plus_value
            FROM invoices
            WHERE status NOT IN ('paid','cancelled') AND deleted_at IS NULL
        ");

        return [
            'current' => ['count' => (int) $data->current_count, 'value' => (float) ($data->current_value ?? 0)],
            'd30' => ['count' => (int) $data->d30_count, 'value' => (float) ($data->d30_value ?? 0)],
            'd60' => ['count' => (int) $data->d60_count, 'value' => (float) ($data->d60_value ?? 0)],
            'd90' => ['count' => (int) $data->d90_count, 'value' => (float) ($data->d90_value ?? 0)],
            'd90plus' => ['count' => (int) $data->d90plus_count, 'value' => (float) ($data->d90plus_value ?? 0)],
        ];
    }

    private function getAtRiskCustomers(): array
    {
        return DB::select("
            SELECT
              c.id, c.name, c.company,
              i.invoice_number, i.total AS invoice_total, i.due_date,
              CURRENT_DATE - i.due_date::date AS days_overdue,
              COALESCE(la.credit_limit, 0) AS credit_limit,
              COALESCE(la.current_balance, 0) AS current_balance,
              ROUND(COALESCE(la.current_balance, 0) / NULLIF(COALESCE(la.credit_limit, 0), 0) * 100, 1) AS utilization_pct,
              COALESCE(t.name, 'N/A') AS territory,
              COALESCE(u.name, 'N/A') AS sales_officer
            FROM invoices i
            JOIN customers c ON c.id = i.customer_id
            LEFT JOIN ledger_accounts la ON la.customer_id = c.id AND la.type = 'debtor' AND la.is_active = true
            LEFT JOIN territories t ON t.id = la.territory_id
            LEFT JOIN users u ON u.id = la.sales_officer_id
            WHERE i.status NOT IN ('paid','cancelled') AND i.deleted_at IS NULL
              AND i.due_date < CURRENT_DATE
            ORDER BY days_overdue DESC, invoice_total DESC
            LIMIT 20
        ");
    }

    private function getCharts(): array
    {
        $weekly = DB::select("
            SELECT DATE_TRUNC('week', v.transaction_date)::date AS week,
                   SUM(v.amount) AS collected
            FROM vouchers v
            WHERE v.type = 'receipt' AND v.status = 'posted'
              AND v.transaction_date >= NOW() - INTERVAL '90 days'
            GROUP BY 1 ORDER BY 1
        ");

        return [
            'weekly_collections' => array_map(fn($row) => [
                'week' => $row->week,
                'collected' => (float) $row->collected,
            ], $weekly),
        ];
    }

    private function generateInsights(array $kpis, array $records): array
    {
        $insights = [];

        if ($kpis['d90plus']['value'] > 0) {
            $insights[] = [
                'severity' => 'critical',
                'message' => '₦' . number_format($kpis['d90plus']['value'], 0) . ' overdue 90+ days — ' . $kpis['d90plus']['count'] . ' customers at bad debt risk',
                'action' => 'Escalate to management / legal',
            ];
        }

        $atRiskOverLimit = array_filter($records, fn($r) => $r->utilization_pct > 100);
        if (count($atRiskOverLimit) > 0) {
            $insights[] = [
                'severity' => 'critical',
                'message' => count($atRiskOverLimit) . ' customers exceeded credit limit',
                'action' => 'Freeze orders for these customers immediately',
            ];
        }

        $nearLimit = array_filter($records, fn($r) => $r->utilization_pct >= 80 && $r->utilization_pct <= 100);
        if (count($nearLimit) > 0) {
            $insights[] = [
                'severity' => 'warning',
                'message' => count($nearLimit) . ' customers at 80-100% of credit limit',
                'action' => 'Request payment before approving new orders',
            ];
        }

        return $insights;
    }

    private function generateRecommendations(array $insights): array
    {
        $recs = [];

        if (count($insights) > 0) {
            $recs[] = 'Review customer credit exposure daily';
            $recs[] = 'Contact customers with invoices 61+ days overdue';
        }

        return $recs;
    }
}
