<?php

namespace App\Models\Audit;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model {
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['user_id', 'user_email', 'device_id', 'action_type', 'entity', 'entity_id', 'before_snapshot', 'after_snapshot', 'ip_address', 'user_agent', 'override_reason', 'metadata'];

    protected $casts = ['before_snapshot' => 'json', 'after_snapshot' => 'json', 'metadata' => 'json'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function getChangesSummary(): array {
        $before = $this->before_snapshot ?? [];
        $after = $this->after_snapshot ?? [];
        $changes = [];

        foreach ($after as $key => $value) {
            if (($before[$key] ?? null) !== $value) {
                $changes[$key] = ['from' => $before[$key] ?? null, 'to' => $value];
            }
        }
        
        return $changes;
    }
}
