<?php

namespace App\Models\Auth;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PasswordReset extends Model {
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['user_id', 'token_hash', 'expires_at', 'used_at'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool {
        return now()->isAfter($this->expires_at);
    }

    public function isUsed(): bool {
        return !is_null($this->used_at);
    }
}
