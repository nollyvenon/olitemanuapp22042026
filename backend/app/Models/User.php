<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Model {
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'email', 'username', 'password_hash', 'first_name', 'last_name',
        'is_active', 'is_sub_admin', 'sub_admin_parent_id', 'created_by', 'updated_by'
    ];

    protected $hidden = ['password_hash'];

    public function roles(): BelongsToMany {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
            ->withPivot('assigned_by', 'assigned_at')->withTimestamps();
    }

    public function groups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'user_groups', 'user_id', 'group_id')
            ->withPivot('assigned_by', 'assigned_at')->withTimestamps();
    }

    public function locations(): BelongsToMany {
        return $this->belongsToMany(Location::class, 'user_locations', 'user_id', 'location_id')
            ->withPivot('assigned_by', 'is_primary', 'assigned_at')->withTimestamps();
    }

    public function loginSessions(): HasMany {
        return $this->hasMany(LoginSession::class);
    }

    public function refreshTokens(): HasMany {
        return $this->hasMany(RefreshToken::class);
    }

    public function createdBy(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function subAdminParent(): BelongsTo {
        return $this->belongsTo(User::class, 'sub_admin_parent_id');
    }

    public function getAllPermissions(): array {
        $permissions = collect();
        
        foreach ($this->groups as $group) {
            $permissions = $permissions->merge($this->getGroupPermissions($group));
        }
        
        foreach ($this->roles as $role) {
            $permissions = $permissions->merge($role->permissions()->pluck('slug'));
        }
        
        return $permissions->unique()->values()->toArray();
    }

    private function getGroupPermissions(Group $group): array {
        $permissions = $group->roles()->with('permissions')->get()
            ->pluck('permissions.*.slug')->flatten()->unique()->toArray();
        
        if ($group->parent_id) {
            $permissions = array_merge($permissions, $this->getGroupPermissions($group->parent));
        }
        
        return $permissions;
    }

    public function hasPermission(string $permissionSlug): bool {
        $perms = $this->getAllPermissions();
        return in_array($permissionSlug, $perms) || in_array(str_replace('*', '*', $permissionSlug), $perms);
    }
}
