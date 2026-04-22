<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model {
    use HasUuids;

    protected $fillable = ['user_id', 'type', 'email', 'in_app'];
    protected $casts = ['email' => 'boolean', 'in_app' => 'boolean'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
