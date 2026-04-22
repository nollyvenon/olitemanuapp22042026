<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Role extends Model {
    use HasUuids;
    use HasFactory, SoftDeletes;


    protected $fillable = ['name', 'slug', 'description', 'is_system'];

    public function permissions(): BelongsToMany {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id')
            ->withPivot('assigned_by', 'assigned_at')->withTimestamps();
    }

    public function groups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'group_roles', 'role_id', 'group_id')
            ->withPivot('assigned_by', 'assigned_at')->withTimestamps();
    }
}
