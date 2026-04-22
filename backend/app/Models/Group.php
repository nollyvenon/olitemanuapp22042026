<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Group extends Model {
    use HasUuids;
    public $timestamps = true;

    protected $fillable = ['name', 'description', 'is_active'];

    public function permissions(): BelongsToMany {
        return $this->belongsToMany(Permission::class, 'group_permissions', 'group_id', 'permission_id');
    }

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class, 'user_groups', 'group_id', 'user_id')
            ->withPivot('assigned_by', 'assigned_at');
    }

    public function locations(): BelongsToMany {
        return $this->belongsToMany(Location::class, 'group_locations', 'group_id', 'location_id');
    }

    public function parentGroups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'group_inheritance', 'child_group_id', 'parent_group_id');
    }

    public function childGroups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'group_inheritance', 'parent_group_id', 'child_group_id');
    }
}
