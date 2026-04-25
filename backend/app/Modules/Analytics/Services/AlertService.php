<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class AlertService
{
    public function getActiveAlerts(): array
    {
        $alerts = [];
        $alerts = array_merge($alerts, $this->checkLowStock());
        $alerts = array_merge($alerts, $this->checkOverdueInvoices());
        $alerts = array_merge($alerts, $this->checkUnusualTransactions());
        $alerts = array_merge($alerts, $this->checkSalesDrop());
        usort($alerts, fn($a, $b) => ($b['priority'] ?? 0) <=> ($a['priority'] ?? 0));
        return array_slice($alerts, 0, 10);
    }

    private function checkLowStock(): array
    {
        $items = DB::select("
            SELECT si.id, si.name, sl.quantity, si.reorder_level
            FROM stock_items si
            LEFT JOIN (SELECT item_id, SUM(quantity) as quantity FROM stock_ledgers GROUP BY item_id) sl ON sl.item_id = si.id
            WHERE si.is_active = true AND COALESCE(sl.quantity, 0) <= si.reorder_level AND COALESCE(sl.quantity, 0) > 0
            ORDER BY COALESCE(sl.quantity, 0) ASC LIMIT 5
        ");
        return array_map(fn($i) => [
            'type' => 'low_stock',
            'severity' => 'warning',
            'title' => "{$i->name} running low",
            'message' => "Stock at {$i->quantity} units, reorder at {$i->reorder_level}",
            'action' => '/dashboard/inventory/items',
            'priority' => 3
        ], $items);
    }

    private function checkOverdueInvoices(): array
    {
        $overdue = DB::selectOne("
            SELECT COUNT(*) as count, SUM(total) as amount FROM invoices
            WHERE status NOT IN ('paid','cancelled') AND CURRENT_DATE - due_date::date > 30
        ");
        if ((int)$overdue->count > 0) {
            return [[
                'type' => 'overdue_invoices',
                'severity' => (int)$overdue->count > 10 ? 'critical' : 'warning',
                'title' => (int)$overdue->count . " invoices overdue",
                'message' => "₦" . round((float)$overdue->amount) . " outstanding for 30+ days",
                'action' => '/dashboard/intelligence/accounts-risk',
                'priority' => (int)$overdue->count > 10 ? 5 : 4
            ]];
        }
        return [];
    }

    private function checkUnusualTransactions(): array
    {
        $unusual = DB::selectOne("
            SELECT COUNT(*) as count, SUM(amount) as total FROM vouchers
            WHERE status = 'posted' AND transaction_date >= CURRENT_DATE - INTERVAL '1 day'
              AND amount > (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY amount) FROM vouchers WHERE status='posted')
        ");
        if ((int)$unusual->count > 0) {
            return [[
                'type' => 'unusual_transactions',
                'severity' => 'info',
                'title' => (int)$unusual->count . " large transactions detected",
                'message' => "Review transactions totaling ₦" . round((float)$unusual->total),
                'action' => '/dashboard/accounts/vouchers',
                'priority' => 2
            ]];
        }
        return [];
    }

    private function checkSalesDrop(): array
    {
        $trend = DB::select("
            SELECT SUM(total) as revenue FROM orders
            WHERE status = 'AUTHORIZED' AND order_date >= NOW() - INTERVAL '7 days' AND is_current = true
        ");
        $prev = DB::select("
            SELECT SUM(total) as revenue FROM orders
            WHERE status = 'AUTHORIZED' AND order_date >= NOW() - INTERVAL '14 days' AND order_date < NOW() - INTERVAL '7 days' AND is_current = true
        ");
        if ((float)$prev[0]->revenue > 0) {
            $drop_pct = ((float)$trend[0]->revenue - (float)$prev[0]->revenue) / (float)$prev[0]->revenue * 100;
            if ($drop_pct < -20) {
                return [[
                    'type' => 'sales_drop',
                    'severity' => abs($drop_pct) > 40 ? 'critical' : 'warning',
                    'title' => "Sales dropped " . round(abs($drop_pct)) . "%",
                    'message' => "This week vs last week trending negative",
                    'action' => '/dashboard/intelligence/sales',
                    'priority' => 4
                ]];
            }
        }
        return [];
    }
}
