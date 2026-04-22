<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Session extends Model {
    use HasUuids;

    protected $fillable = [
        'user_id', 'device_id', 'access_token_hash', 'refresh_token_hash',
        'ip_address', 'location_lat', 'location_long', 'ip_city', 'ip_country',
        'gps_source', 'issued_at', 'expires_at', 'revoked_at', 'is_active'
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function device(): BelongsTo {
        return $this->belongsTo(Device::class);
    }
}
