<?php

namespace App\Modules\Audit\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Queue;

class AuditService {
    public static function log(array $data): void {
        $logData = [
            'user_id' => $data['user_id'] ?? null,
            'acting_on_behalf_of' => $data['acting_on_behalf_of'] ?? null,
            'action_type' => $data['action_type'],
            'entity_type' => $data['entity_type'],
            'entity_id' => $data['entity_id'] ?? null,
            'before_snapshot' => $data['before_snapshot'] ?? null,
            'after_snapshot' => $data['after_snapshot'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'device_id' => $data['device_id'] ?? null,
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'location_lat' => $data['location_lat'] ?? null,
            'location_long' => $data['location_long'] ?? null,
            'created_at' => now(),
        ];

        if (config('audit.async', false)) {
            Queue::push(function () use ($logData) {
                AuditLog::create($logData);
            });
        } else {
            AuditLog::create($logData);
        }
    }
}
