<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class AccountsRiskService
{
    public function getInsights(): array
    {
        return [
            'receivables' => $this->receivablesAnalysis(),
            'payables' => $this->payablesAnalysis(),
            'aging_analysis' => $this->agingAnalysis(),
            'overdue_customers' => $this->detectOverdueCustomers(),
            'risky_accounts' => $this->detectRiskyAccounts(),
            'risk_scores' => $this->scoreCustomers(),
            'cash_forecast' => $this->forecastCashFlow(),
            'follow_ups' => $this->generateFollowUps(),
            'credit_recommendations' => $this->creditLimitRecommendations(),
        ];
    }

    private function receivablesAnalysis(): array
    {
        return DB::select("
            SELECT c.id, c.name,
                SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END) AS outstanding,
                SUM(CASE WHEN i.status NOT IN ('paid','cancelled') AND CURRENT_DATE-i.due_date::date > 30 THEN i.total ELSE 0 END) AS overdue_30,
                SUM(CASE WHEN i.status NOT IN ('paid','cancelled') AND CURRENT_DATE-i.due_date::date > 90 THEN i.total ELSE 0 END) AS overdue_90,
                COUNT(DISTINCT CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.id END) AS invoice_count,
                AVG(EXTRACT(DAY FROM (CURRENT_DATE - i.due_date::date)))::int AS avg_days_overdue
            FROM customers c
            LEFT JOIN invoices i ON i.customer_id = c.id AND i.deleted_at IS NULL
            GROUP BY c.id, c.name
            ORDER BY outstanding DESC
        ");
    }

    private function payablesAnalysis(): array
    {
        return DB::select("
            SELECT v.id, v.reference,
                CASE WHEN v.type='debit_note' THEN 'Payable' ELSE 'Receivable' END AS type,
                v.amount, v.due_date, v.status,
                CASE WHEN CURRENT_DATE > v.due_date::date THEN EXTRACT(DAY FROM (CURRENT_DATE - v.due_date::date)) ELSE 0 END::int AS days_overdue
            FROM vouchers v
            WHERE v.status='posted' AND v.deleted_at IS NULL
              AND v.due_date IS NOT NULL
            ORDER BY v.due_date ASC
        ");
    }

    private function agingAnalysis(): array
    {
        return DB::select("
            SELECT
                SUM(i.total) FILTER (WHERE i.status NOT IN ('paid','cancelled') AND CURRENT_DATE <= i.due_date::date) AS current,
                SUM(i.total) FILTER (WHERE i.status NOT IN ('paid','cancelled') AND CURRENT_DATE-i.due_date::date BETWEEN 1 AND 30) AS d30,
                SUM(i.total) FILTER (WHERE i.status NOT IN ('paid','cancelled') AND CURRENT_DATE-i.due_date::date BETWEEN 31 AND 60) AS d60,
                SUM(i.total) FILTER (WHERE i.status NOT IN ('paid','cancelled') AND CURRENT_DATE-i.due_date::date BETWEEN 61 AND 90) AS d90,
                SUM(i.total) FILTER (WHERE i.status NOT IN ('paid','cancelled') AND CURRENT_DATE-i.due_date::date > 90) AS d90plus,
                SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END) AS total_outstanding
            FROM invoices i
            WHERE i.deleted_at IS NULL
        ");
    }

    private function detectOverdueCustomers(): array
    {
        return DB::select("
            SELECT c.id, c.name, c.email,
                SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END) AS amount_due,
                COUNT(*) AS overdue_invoices,
                MAX(CURRENT_DATE - i.due_date::date)::int AS days_overdue,
                ROUND(SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END)::numeric /
                  NULLIF(SUM(i.total), 0) * 100, 1) AS overdue_percent
            FROM customers c
            LEFT JOIN invoices i ON i.customer_id = c.id AND i.deleted_at IS NULL
            WHERE i.deleted_at IS NULL AND CURRENT_DATE > i.due_date::date AND i.status NOT IN ('paid','cancelled')
            GROUP BY c.id, c.name, c.email
            ORDER BY amount_due DESC
        ");
    }

    private function detectRiskyAccounts(): array
    {
        $risky = [];
        $customers = DB::select("
            SELECT c.id, c.name,
                SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END) AS outstanding,
                SUM(CASE WHEN i.status='paid' THEN i.total ELSE 0 END) AS paid_total,
                COUNT(DISTINCT CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.id END) AS open_invoices,
                MAX(EXTRACT(DAY FROM (CURRENT_DATE - i.due_date::date)))::int AS max_days_overdue,
                COALESCE(c.credit_limit, 0) AS credit_limit
            FROM customers c
            LEFT JOIN invoices i ON i.customer_id = c.id AND i.deleted_at IS NULL
            GROUP BY c.id, c.name, c.credit_limit
        ");
        foreach ($customers as $c) {
            $risk_flags = [];
            if ((int)$c->max_days_overdue > 60) $risk_flags[] = 'severely_overdue';
            if ((float)$c->outstanding > (float)$c->credit_limit * 0.9 && (float)$c->credit_limit > 0) $risk_flags[] = 'near_limit';
            if ((int)$c->open_invoices > 5) $risk_flags[] = 'multiple_invoices';
            if ((float)$c->paid_total == 0 && (float)$c->outstanding > 0) $risk_flags[] = 'never_paid';
            if (count($risk_flags) > 0) {
                $risky[] = [
                    'id' => $c->id, 'name' => $c->name, 'outstanding' => (float)$c->outstanding,
                    'risk_flags' => implode(', ', $risk_flags), 'action' => 'Review credit terms'
                ];
            }
        }
        return $risky;
    }

    private function scoreCustomers(): array
    {
        $scores = [];
        $customers = DB::select("
            SELECT c.id, c.name,
                COALESCE(SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END), 0) AS outstanding,
                COALESCE(SUM(i.total), 0) AS lifetime_sales,
                COUNT(*) AS total_invoices,
                COUNT(CASE WHEN i.status='paid' THEN 1 END) AS paid_count,
                MAX(EXTRACT(DAY FROM (CURRENT_DATE - i.due_date::date)))::int AS max_days_overdue,
                COALESCE(c.credit_limit, 0) AS credit_limit
            FROM customers c
            LEFT JOIN invoices i ON i.customer_id = c.id AND i.deleted_at IS NULL
            GROUP BY c.id, c.name, c.credit_limit
        ");
        foreach ($customers as $c) {
            $score = 100;
            $payment_rate = (int)$c->total_invoices > 0 ? ((int)$c->paid_count / (int)$c->total_invoices) * 100 : 0;
            $score -= max(0, 50 * (1 - $payment_rate / 100));
            if ((int)$c->max_days_overdue > 90) $score -= 30;
            elseif ((int)$c->max_days_overdue > 60) $score -= 15;
            elseif ((int)$c->max_days_overdue > 30) $score -= 5;
            if ((float)$c->credit_limit > 0) {
                $util = (float)$c->outstanding / (float)$c->credit_limit;
                $score -= min(20, $util * 20);
            }
            $risk_level = $score >= 80 ? 'low' : ($score >= 60 ? 'medium' : 'high');
            $scores[] = [
                'id' => $c->id, 'name' => $c->name, 'score' => max(0, $score),
                'risk_level' => $risk_level, 'payment_rate' => round($payment_rate, 1),
                'outstanding' => (float)$c->outstanding
            ];
        }
        usort($scores, fn($a, $b) => $a['score'] <=> $b['score']);
        return $scores;
    }

    private function forecastCashFlow(): array
    {
        $inflow = DB::selectOne("
            SELECT SUM(amount) FILTER (WHERE type='receipt' AND transaction_date >= CURRENT_DATE AND transaction_date < CURRENT_DATE + INTERVAL '30 days') as next_30 FROM vouchers WHERE status='posted'
        ");
        $outflow = DB::selectOne("
            SELECT SUM(amount) FILTER (WHERE type='debit_note' AND due_date >= CURRENT_DATE AND due_date < CURRENT_DATE + INTERVAL '30 days') as next_30 FROM vouchers WHERE status='posted'
        ");
        return [
            'inflow_30d' => (float)($inflow->next_30 ?? 0),
            'outflow_30d' => (float)($outflow->next_30 ?? 0),
            'net_cash_30d' => (float)($inflow->next_30 ?? 0) - (float)($outflow->next_30 ?? 0),
        ];
    }

    private function generateFollowUps(): array
    {
        $followups = [];
        $overdue = DB::select("
            SELECT c.id, c.name, c.email, c.phone,
                MAX(CURRENT_DATE - i.due_date::date)::int AS days_overdue,
                SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END) AS amount_due
            FROM customers c
            JOIN invoices i ON i.customer_id = c.id AND i.deleted_at IS NULL
            WHERE i.status NOT IN ('paid','cancelled') AND CURRENT_DATE > i.due_date::date
            GROUP BY c.id, c.name, c.email, c.phone
            ORDER BY amount_due DESC
        ");
        foreach ($overdue as $o) {
            $urgency = (int)$o->days_overdue > 90 ? 'urgent' : ((int)$o->days_overdue > 60 ? 'high' : 'normal');
            $followups[] = [
                'customer_id' => $o->id, 'name' => $o->name, 'email' => $o->email, 'phone' => $o->phone,
                'amount_due' => (float)$o->amount_due, 'days_overdue' => (int)$o->days_overdue,
                'action' => $urgency === 'urgent' ? 'Call immediately' : 'Send reminder',
                'urgency' => $urgency
            ];
        }
        return $followups;
    }

    private function creditLimitRecommendations(): array
    {
        $recs = [];
        $customers = DB::select("
            SELECT c.id, c.name,
                COALESCE(SUM(CASE WHEN i.status NOT IN ('paid','cancelled') THEN i.total ELSE 0 END), 0) AS outstanding,
                COALESCE(SUM(i.total), 0) AS lifetime_sales,
                COUNT(CASE WHEN i.status='paid' THEN 1 END) AS paid_count,
                COUNT(*) AS total_invoices,
                COALESCE(c.credit_limit, 0) AS current_limit
            FROM customers c
            LEFT JOIN invoices i ON i.customer_id = c.id AND i.deleted_at IS NULL
            GROUP BY c.id, c.name, c.credit_limit
        ");
        foreach ($customers as $c) {
            $payment_rate = (int)$c->total_invoices > 0 ? (int)$c->paid_count / (int)$c->total_invoices : 0;
            if ($payment_rate >= 0.9 && (float)$c->outstanding < (float)$c->current_limit * 0.5) {
                $new_limit = (float)$c->current_limit * 1.25;
                $recs[] = ['customer_id' => $c->id, 'name' => $c->name, 'current_limit' => (float)$c->current_limit, 'recommended_limit' => $new_limit, 'reason' => 'Excellent payment history'];
            } elseif ($payment_rate < 0.7 || (float)$c->outstanding > (float)$c->current_limit * 0.9) {
                $new_limit = max((float)$c->current_limit * 0.75, (float)$c->outstanding);
                $recs[] = ['customer_id' => $c->id, 'name' => $c->name, 'current_limit' => (float)$c->current_limit, 'recommended_limit' => $new_limit, 'reason' => 'High risk - reduce limit'];
            }
        }
        return $recs;
    }
}
