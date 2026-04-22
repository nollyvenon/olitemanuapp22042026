<?php

namespace App\Models\Auth;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model {
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['user_id', 'token_hash', 'family', 'expires_at', 'used_at', 'revoked_at', 'ip_address', 'device_fingerprint', 'user_agent'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool {
        return now()->isAfter($this->expires_at);
    }

    public function isRevoked(): bool {
        return !is_null($this->revoked_at);
    }
}
