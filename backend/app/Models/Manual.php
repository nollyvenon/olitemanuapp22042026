<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Manual extends Model {
    use HasUuids;

    protected $fillable = ['category_id', 'title', 'slug', 'content', 'excerpt', 'type', 'status', 'created_by', 'updated_by', 'published_at', 'related_articles', 'keywords'];
    protected $casts = ['related_articles' => 'array', 'keywords' => 'array', 'published_at' => 'datetime'];

    public function category(): BelongsTo { return $this->belongsTo(ManualCategory::class); }
    public function versions(): HasMany { return $this->hasMany(ManualVersion::class); }
    public function permissions(): HasMany { return $this->hasMany(ManualPermission::class); }
    public function feedback(): HasMany { return $this->hasMany(ManualFeedback::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }

    public function isAccessibleBy(User $user): bool {
        if ($this->status !== 'published') return false;
        $perms = $this->permissions()->get();
        if ($perms->isEmpty()) return true;
        foreach ($perms as $perm) {
            if ($perm->visibility === 'public') return true;
            if ($perm->visibility === 'role_based' && $user->roles->pluck('id')->contains($perm->role_id)) return true;
            if ($perm->visibility === 'group_based' && $user->groups->pluck('id')->contains($perm->group_id)) return true;
        }
        return false;
    }
}
