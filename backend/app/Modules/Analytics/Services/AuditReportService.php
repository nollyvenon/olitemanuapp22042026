<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\DB;

class AuditReportService
{
    public function getTransactionHistory(array $filters = []): array
    {
        $query = "
            SELECT v.id, v.reference, v.type, v.amount, v.status, v.transaction_date, u.name as user_name,
              CASE WHEN v.amount > (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY amount) FROM vouchers) THEN 'high_value' ELSE 'normal' END as flag
            FROM vouchers v
            LEFT JOIN users u ON v.created_by = u.id
            WHERE v.deleted_at IS NULL
        ";
        if ($filters['start_date'] ?? null) $query .= " AND v.transaction_date >= '{$filters['start_date']}'";
        if ($filters['end_date'] ?? null) $query .= " AND v.transaction_date <= '{$filters['end_date']}'";
        if ($filters['type'] ?? null) $query .= " AND v.type = '{$filters['type']}'";
        if ($filters['status'] ?? null) $query .= " AND v.status = '{$filters['status']}'";
        $query .= " ORDER BY v.transaction_date DESC LIMIT 500";
        return DB::select($query);
    }

    public function getUserActivityLogs(array $filters = []): array
    {
        $query = "
            SELECT al.id, al.user_id, u.name as user_name, al.action, al.entity_type, al.entity_id,
              al.description, al.ip_address, al.created_at, al.user_agent,
              CASE WHEN al.ip_address NOT IN (SELECT DISTINCT ip_address FROM audit_logs WHERE user_id=al.user_id LIMIT 5) THEN 'new_ip' ELSE 'known' END as location_flag
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.deleted_at IS NULL
        ";
        if ($filters['user_id'] ?? null) $query .= " AND al.user_id = '{$filters['user_id']}'";
        if ($filters['action'] ?? null) $query .= " AND al.action = '{$filters['action']}'";
        if ($filters['start_date'] ?? null) $query .= " AND al.created_at >= '{$filters['start_date']}'";
        if ($filters['end_date'] ?? null) $query .= " AND al.created_at <= '{$filters['end_date']}'";
        $query .= " ORDER BY al.created_at DESC LIMIT 1000";
        return DB::select($query);
    }

    public function getOverrideTracking(array $filters = []): array
    {
        $query = "
            SELECT al.id, al.user_id, u.name as user_name, al.entity_type, al.entity_id, al.description,
              al.created_at, al.ip_address,
              CASE WHEN COUNT(*) OVER (PARTITION BY al.user_id, DATE_TRUNC('day', al.created_at)) > 5 THEN 'high_frequency' ELSE 'normal' END as frequency
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.action IN ('override', 'force_transition', 'suspend_user', 'override_price', 'override_inventory') AND al.deleted_at IS NULL
        ";
        if ($filters['user_id'] ?? null) $query .= " AND al.user_id = '{$filters['user_id']}'";
        if ($filters['start_date'] ?? null) $query .= " AND al.created_at >= '{$filters['start_date']}'";
        if ($filters['end_date'] ?? null) $query .= " AND al.created_at <= '{$filters['end_date']}'";
        $query .= " ORDER BY al.created_at DESC LIMIT 500";
        return DB::select($query);
    }

    public function detectSuspiciousActivity(): array
    {
        $suspicious = [];

        $bulk_deletes = DB::selectOne("
            SELECT COUNT(*) as count, u.id, u.name FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.action = 'delete' AND al.created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY u.id, u.name HAVING COUNT(*) > 20
        ");
        if ($bulk_deletes && (int)$bulk_deletes->count > 20) {
            $suspicious[] = [
                'type' => 'bulk_delete',
                'severity' => 'critical',
                'user' => $bulk_deletes->name,
                'detail' => "{$bulk_deletes->count} deletions in 24 hours",
                'timestamp' => now()
            ];
        }

        $failed_logins = DB::selectOne("
            SELECT COUNT(*) as count, u.id, u.name FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.action = 'failed_login' AND al.created_at >= NOW() - INTERVAL '1 hour'
            GROUP BY u.id, u.name HAVING COUNT(*) > 5
        ");
        if ($failed_logins && (int)$failed_logins->count > 5) {
            $suspicious[] = [
                'type' => 'brute_force',
                'severity' => 'critical',
                'user' => $failed_logins->name,
                'detail' => "{$failed_logins->count} failed logins in 1 hour",
                'timestamp' => now()
            ];
        }

        $unusual_ips = DB::select("
            SELECT u.id, u.name, al.ip_address, COUNT(*) as action_count FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.created_at >= NOW() - INTERVAL '1 hour' AND al.ip_address NOT IN (
                SELECT DISTINCT ip_address FROM audit_logs WHERE user_id = al.user_id AND created_at >= NOW() - INTERVAL '90 days' LIMIT 3
            )
            GROUP BY u.id, u.name, al.ip_address HAVING COUNT(*) > 2
        ");
        foreach ($unusual_ips as $ip) {
            $suspicious[] = [
                'type' => 'unusual_location',
                'severity' => 'warning',
                'user' => $ip->name,
                'detail' => "New IP {$ip->ip_address} with {$ip->action_count} actions",
                'timestamp' => now()
            ];
        }

        $large_overrides = DB::select("
            SELECT al.user_id, u.name, al.description, al.created_at, COUNT(*) as override_count FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.action IN ('override_price', 'override_inventory') AND al.created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY al.user_id, u.name, al.description, al.created_at HAVING COUNT(*) > 3
        ");
        foreach ($large_overrides as $ov) {
            $suspicious[] = [
                'type' => 'excessive_overrides',
                'severity' => 'warning',
                'user' => $ov->name,
                'detail' => "{$ov->override_count} overrides in 24 hours",
                'timestamp' => $ov->created_at
            ];
        }

        return $suspicious;
    }

    public function getAuditSummary(): array
    {
        $summary = DB::select("
            SELECT
              (SELECT COUNT(*) FROM audit_logs WHERE created_at >= NOW() - INTERVAL '24 hours') as logs_24h,
              (SELECT COUNT(*) FROM audit_logs WHERE action IN ('override', 'force_transition', 'suspend_user') AND created_at >= NOW() - INTERVAL '24 hours') as overrides_24h,
              (SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE created_at >= NOW() - INTERVAL '24 hours') as active_users_24h,
              (SELECT COUNT(*) FROM vouchers WHERE created_at >= NOW() - INTERVAL '24 hours' AND deleted_at IS NULL) as transactions_24h
        ");
        return $summary ?? [];
    }
}
