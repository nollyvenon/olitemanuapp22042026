<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Model {
    use HasUuids;

    protected $fillable = ['name', 'email', 'password_hash', 'is_active', 'is_sub_admin', 'is_god_admin', 'force_password_reset', 'created_by'];
    protected $hidden = ['password_hash'];
    protected $appends = ['permissions'];

    public function groups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'user_groups', 'user_id', 'group_id')
            ->withPivot('assigned_by', 'assigned_at');
    }

    public function locations(): BelongsToMany {
        return $this->belongsToMany(Location::class, 'user_locations', 'user_id', 'location_id');
    }

    public function devices(): HasMany {
        return $this->hasMany(Device::class);
    }

    public function sessions(): HasMany {
        return $this->hasMany(Session::class);
    }

    public function passwordResetTokens(): HasMany {
        return $this->hasMany(PasswordResetToken::class);
    }

    public function createdBy(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function godModeActions(): HasMany {
        return $this->hasMany(GodModeAction::class, 'god_admin_id');
    }

    public function godModeConfirmations(): HasMany {
        return $this->hasMany(GodModeConfirmation::class, 'god_admin_id');
    }

    public function getPermissionsAttribute(): array {
        $groupService = app(\App\Modules\Auth\Services\GroupService::class);
        $groupIds = $this->groups()->pluck('groups.id')->toArray();
        return $groupService->getEffectivePermissions($groupIds);
    }
}
