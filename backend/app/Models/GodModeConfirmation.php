<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GodModeConfirmation extends Model
{
    use HasUuids;

    protected $table = 'god_mode_confirmations';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'god_admin_id',
        'action_type',
        'reason',
        'status',
        'confirmed_by',
        'confirmed_at',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function godAdmin()
    {
        return $this->belongsTo(User::class, 'god_admin_id');
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
