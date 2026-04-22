<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Location extends Model {
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'latitude', 'longitude', 'address', 'city', 'state', 'country', 'is_active', 'created_by'];

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class, 'user_locations', 'location_id', 'user_id')
            ->withPivot('assigned_by', 'is_primary', 'assigned_at')->withTimestamps();
    }

    public function creator(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }
}
