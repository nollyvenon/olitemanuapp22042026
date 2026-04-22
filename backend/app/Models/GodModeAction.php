<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GodModeAction extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'god_mode_actions';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'god_admin_id',
        'action_type',
        'module',
        'affected_entity_id',
        'affected_entity_type',
        'previous_state',
        'new_state',
        'reason',
        'impersonated_user_id',
        'device_id',
        'ip_address',
    ];

    protected $casts = [
        'previous_state' => 'array',
        'new_state' => 'array',
        'created_at' => 'datetime',
    ];

    public function godAdmin()
    {
        return $this->belongsTo(User::class, 'god_admin_id');
    }

    public function impersonatedUser()
    {
        return $this->belongsTo(User::class, 'impersonated_user_id');
    }

    public function device()
    {
        return $this->belongsTo(DeviceRegistry::class, 'device_id');
    }
}
