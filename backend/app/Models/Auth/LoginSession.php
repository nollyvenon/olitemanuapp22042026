<?php

namespace App\Models\Auth;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginSession extends Model {
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['user_id', 'device_fingerprint', 'device_os', 'device_browser', 'ip_address', 'latitude', 'longitude', 'logged_in_at', 'last_activity_at', 'logged_out_at'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
