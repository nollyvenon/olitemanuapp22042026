<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Location extends Model {
    use HasUuids;

    protected $fillable = ['name', 'address', 'city', 'state', 'country', 'lat', 'long', 'is_active'];

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class, 'user_locations', 'location_id', 'user_id');
    }

    public function groups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'group_locations', 'location_id', 'group_id');
    }
}
