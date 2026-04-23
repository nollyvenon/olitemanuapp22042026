<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Device extends Model {
    use HasUuids;

    protected $table = 'device_registry';
    protected $fillable = ['user_id', 'fingerprint', 'user_agent', 'os', 'browser', 'first_seen_at', 'last_seen_at', 'is_trusted'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function sessions(): HasMany {
        return $this->hasMany(Session::class);
    }
}
