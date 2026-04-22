<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model {
    use HasUuids;

    protected $fillable = ['user_id', 'acting_on_behalf_of', 'action_type', 'entity_type', 'entity_id', 'before_snapshot', 'after_snapshot', 'metadata', 'device_id', 'ip_address', 'location_lat', 'location_long'];
    protected $casts = ['before_snapshot' => 'json', 'after_snapshot' => 'json', 'metadata' => 'json', 'created_at' => 'datetime'];
    public $timestamps = false;

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
