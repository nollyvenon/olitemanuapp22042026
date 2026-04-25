<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class SalesPerformanceService
{
    public function getInsights(): array
    {
        return [
            'performance_metrics' => $this->performanceMetrics(),
            'conversion_rates' => $this->conversionRates(),
            'success_rates' => $this->successRates(),
            'top_performers' => $this->topPerformers(),
            'underperformers' => $this->underperformers(),
            'behavioral_patterns' => $this->behavioralPatterns(),
            'training_recommendations' => $this->trainingRecommendations(),
            'territory_adjustments' => $this->territoryAdjustments(),
            'leaderboard' => $this->leaderboard(),
        ];
    }

    private function performanceMetrics(): array
    {
        return DB::select("
            SELECT u.id, u.name,
                COUNT(DISTINCT o.id) AS total_orders,
                SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END) AS authorized_orders,
                SUM(CASE WHEN o.status IN ('SUBMITTED','UNDER_REVIEW','APPROVED') THEN 1 ELSE 0 END) AS pending_orders,
                SUM(CASE WHEN o.status='AUTHORIZED' THEN o.total ELSE 0 END) AS authorized_revenue,
                COUNT(DISTINCT o.customer_id) AS unique_customers,
                ROUND(AVG(o.total)::numeric, 2) AS avg_order_value,
                ROUND((SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END)::float / COUNT(o.id) * 100)::numeric, 1) AS auth_rate
            FROM users u
            LEFT JOIN orders o ON o.created_by = u.id AND o.deleted_at IS NULL AND o.order_date >= NOW() - INTERVAL '90 days'
            WHERE u.role IN ('sales_officer','manager')
            GROUP BY u.id, u.name
            ORDER BY authorized_revenue DESC
        ");
    }

    private function conversionRates(): array
    {
        return DB::select("
            SELECT u.id, u.name,
                COUNT(DISTINCT c.id) AS contacts,
                COUNT(DISTINCT o.customer_id) AS customers_converted,
                ROUND((COUNT(DISTINCT o.customer_id)::float / NULLIF(COUNT(DISTINCT c.id), 0) * 100)::numeric, 1) AS conversion_rate,
                COUNT(DISTINCT o.id) AS total_orders
            FROM users u
            LEFT JOIN customers c ON c.assigned_to = u.id
            LEFT JOIN orders o ON o.customer_id = c.id AND o.status='AUTHORIZED' AND o.deleted_at IS NULL
            WHERE u.role IN ('sales_officer','manager')
            GROUP BY u.id, u.name
            ORDER BY conversion_rate DESC NULLS LAST
        ");
    }

    private function successRates(): array
    {
        return DB::select("
            SELECT u.id, u.name,
                COUNT(DISTINCT o.id) AS orders_created,
                SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END) AS orders_authorized,
                SUM(CASE WHEN o.status='REJECTED' THEN 1 ELSE 0 END) AS orders_rejected,
                ROUND((SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END)::float / COUNT(o.id) * 100)::numeric, 1) AS success_rate,
                ROUND((SUM(CASE WHEN o.status='REJECTED' THEN 1 ELSE 0 END)::float / COUNT(o.id) * 100)::numeric, 1) AS rejection_rate
            FROM users u
            LEFT JOIN orders o ON o.created_by = u.id AND o.deleted_at IS NULL AND o.order_date >= NOW() - INTERVAL '90 days'
            WHERE u.role IN ('sales_officer','manager')
            GROUP BY u.id, u.name
            ORDER BY success_rate DESC
        ");
    }

    private function topPerformers(): array
    {
        $data = DB::select("
            SELECT u.id, u.name,
                SUM(CASE WHEN o.status='AUTHORIZED' THEN o.total ELSE 0 END) AS revenue,
                COUNT(DISTINCT o.id) AS orders,
                COUNT(DISTINCT o.customer_id) AS customers
            FROM users u
            LEFT JOIN orders o ON o.created_by = u.id AND o.status='AUTHORIZED' AND o.deleted_at IS NULL AND o.order_date >= NOW() - INTERVAL '90 days'
            WHERE u.role IN ('sales_officer','manager')
            GROUP BY u.id, u.name
            ORDER BY revenue DESC LIMIT 5
        ");
        return array_map(fn($p) => [
            'id' => $p->id, 'name' => $p->name, 'revenue' => (float)$p->revenue, 'orders' => (int)$p->orders,
            'customers' => (int)$p->customers, 'award' => 'High performer'
        ], $data);
    }

    private function underperformers(): array
    {
        $data = DB::select("
            SELECT u.id, u.name,
                COUNT(DISTINCT o.id) AS orders,
                ROUND((SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(o.id), 0) * 100)::numeric, 1) AS success_rate
            FROM users u
            LEFT JOIN orders o ON o.created_by = u.id AND o.deleted_at IS NULL AND o.order_date >= NOW() - INTERVAL '90 days'
            WHERE u.role IN ('sales_officer','manager') AND COUNT(o.id) >= 5
            GROUP BY u.id, u.name
            HAVING (SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END)::float / COUNT(o.id) * 100) < 50
            ORDER BY success_rate ASC
        ");
        return array_map(fn($u) => [
            'id' => $u->id, 'name' => $u->name, 'orders' => (int)$u->orders,
            'success_rate' => (float)$u->success_rate, 'concern' => 'Below 50% success rate'
        ], $data);
    }

    private function behavioralPatterns(): array
    {
        $patterns = [];
        $officers = DB::select("
            SELECT u.id, u.name,
                COUNT(DISTINCT CASE WHEN EXTRACT(DOW FROM o.order_date) IN (0,6) THEN o.id END)::int AS weekend_orders,
                COUNT(DISTINCT o.id)::int AS total_orders,
                AVG(EXTRACT(HOUR FROM o.created_at))::int AS avg_time_created,
                COUNT(DISTINCT CASE WHEN o.status='REJECTED' THEN o.id END)::int AS rejections,
                ROUND((COUNT(DISTINCT CASE WHEN o.status='REJECTED' THEN o.id END)::float / COUNT(o.id) * 100)::numeric, 1) AS rejection_pct
            FROM users u
            LEFT JOIN orders o ON o.created_by = u.id AND o.deleted_at IS NULL AND o.order_date >= NOW() - INTERVAL '90 days'
            WHERE u.role IN ('sales_officer','manager')
            GROUP BY u.id, u.name
        ");
        foreach ($officers as $o) {
            if ((int)$o->weekend_orders > (int)$o->total_orders * 0.3) {
                $patterns[] = ['officer_id' => $o->id, 'name' => $o->name, 'pattern' => 'High weekend activity'];
            }
            if ((float)$o->rejection_pct > 30) {
                $patterns[] = ['officer_id' => $o->id, 'name' => $o->name, 'pattern' => 'High rejection rate'];
            }
            if ((int)$o->avg_time_created < 9) {
                $patterns[] = ['officer_id' => $o->id, 'name' => $o->name, 'pattern' => 'Early morning orders'];
            }
        }
        return $patterns;
    }

    private function trainingRecommendations(): array
    {
        $recs = [];
        $underperformers = DB::select("
            SELECT u.id, u.name,
                ROUND((SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END)::float / COUNT(o.id) * 100)::numeric, 1) AS success_rate,
                COUNT(DISTINCT o.id)::int AS orders
            FROM users u
            LEFT JOIN orders o ON o.created_by = u.id AND o.deleted_at IS NULL AND o.order_date >= NOW() - INTERVAL '90 days'
            WHERE u.role IN ('sales_officer','manager')
            GROUP BY u.id, u.name
            HAVING COUNT(o.id) >= 5
        ");
        foreach ($underperformers as $u) {
            if ((float)$u->success_rate < 60) {
                $recs[] = [
                    'officer_id' => $u->id, 'name' => $u->name,
                    'training' => 'Product knowledge and objection handling',
                    'reason' => 'Success rate ' . $u->success_rate . '%'
                ];
            }
            if ((float)$u->success_rate < 40) {
                $recs[] = [
                    'officer_id' => $u->id, 'name' => $u->name,
                    'training' => 'Sales fundamentals and closing techniques',
                    'reason' => 'Critical: Success rate ' . $u->success_rate . '%'
                ];
            }
        }
        return $recs;
    }

    private function territoryAdjustments(): array
    {
        $adjustments = [];
        $territories = DB::select("
            SELECT u.id, u.name,
                l.id as location_id, l.name as location,
                SUM(o.total) AS territory_revenue,
                COUNT(DISTINCT o.customer_id) AS customers
            FROM users u
            JOIN customers c ON c.assigned_to = u.id
            JOIN locations l ON l.id = c.location_id
            LEFT JOIN orders o ON o.customer_id = c.id AND o.status='AUTHORIZED' AND o.deleted_at IS NULL
            GROUP BY u.id, u.name, l.id, l.name
        ");
        $avg_rev = DB::selectOne("SELECT AVG(t) as avg FROM (SELECT SUM(o.total) as t FROM users u LEFT JOIN orders o ON o.created_by = u.id AND o.status='AUTHORIZED' GROUP BY u.id) sub");
        foreach ($territories as $t) {
            if ((float)$t->territory_revenue < (float)$avg_rev->avg * 0.5) {
                $adjustments[] = [
                    'officer_id' => $t->id, 'name' => $t->name, 'location' => $t->location,
                    'action' => 'Expand territory or add support',
                    'reason' => 'Below average performance'
                ];
            }
        }
        return $adjustments;
    }

    private function leaderboard(): array
    {
        $data = DB::select("
            SELECT ROW_NUMBER() OVER (ORDER BY SUM(CASE WHEN o.status='AUTHORIZED' THEN o.total ELSE 0 END) DESC) as rank,
                u.id, u.name,
                SUM(CASE WHEN o.status='AUTHORIZED' THEN o.total ELSE 0 END) AS revenue,
                COUNT(DISTINCT o.id) AS orders,
                ROUND((SUM(CASE WHEN o.status='AUTHORIZED' THEN 1 ELSE 0 END)::float / COUNT(o.id) * 100)::numeric, 1) AS success_rate,
                COUNT(DISTINCT o.customer_id) AS customers
            FROM users u
            LEFT JOIN orders o ON o.created_by = u.id AND o.deleted_at IS NULL AND o.order_date >= NOW() - INTERVAL '90 days'
            WHERE u.role IN ('sales_officer','manager')
            GROUP BY u.id, u.name
            ORDER BY revenue DESC
        ");
        return array_map(fn($r) => [
            'rank' => (int)$r->rank, 'name' => $r->name, 'revenue' => (float)$r->revenue,
            'orders' => (int)$r->orders, 'success_rate' => (float)$r->success_rate,
            'customers' => (int)$r->customers
        ], $data);
    }
}
