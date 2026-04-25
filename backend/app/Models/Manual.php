<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Manual extends Model {
    use HasUuids;

    protected $fillable = ['title', 'content', 'module', 'slug', 'roles_allowed', 'created_by'];
    protected $casts = ['roles_allowed' => 'array'];

    public function creator(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }
}
