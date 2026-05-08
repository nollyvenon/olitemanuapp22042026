<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ManualCategory extends Model {
    use HasUuids;
    protected $fillable = ['name', 'slug', 'description', 'order', 'is_active'];
    public function manuals(): HasMany { return $this->hasMany(Manual::class, 'category_id'); }
}
