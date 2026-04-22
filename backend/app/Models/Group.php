<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model {
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'description', 'parent_id', 'is_system'];

    public function parent(): BelongsTo {
        return $this->belongsTo(Group::class, 'parent_id');
    }

    public function children(): HasMany {
        return $this->hasMany(Group::class, 'parent_id');
    }

    public function roles(): BelongsToMany {
        return $this->belongsToMany(Role::class, 'group_roles', 'group_id', 'role_id')
            ->withPivot('assigned_by', 'assigned_at')->withTimestamps();
    }

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class, 'user_groups', 'group_id', 'user_id')
            ->withPivot('assigned_by', 'assigned_at')->withTimestamps();
    }
}
