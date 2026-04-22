<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PasswordResetToken extends Model {
    use HasUuids;
    public $timestamps = false;

    protected $fillable = ['user_id', 'token_hash', 'requested_by', 'expires_at', 'used_at', 'created_at'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function requestedByUser(): BelongsTo {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
