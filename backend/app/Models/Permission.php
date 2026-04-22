<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Permission extends Model {
    use HasUuids;
    public $timestamps = false;

    protected $fillable = ['name', 'module', 'description'];

    public function groups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'group_permissions', 'permission_id', 'group_id');
    }
}
