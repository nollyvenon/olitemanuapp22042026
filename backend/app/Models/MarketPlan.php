<?php

namespace App\Models;

use App\Traits\Versionable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketPlan extends Model {
    use HasUuids, Versionable;

    protected $fillable = ['type', 'remark', 'status', 'created_by', 'vetted_by', 'vetted_at', 'version_number', 'parent_id', 'is_current'];
    protected $casts = ['vetted_at' => 'datetime'];

    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function vettedBy(): BelongsTo { return $this->belongsTo(User::class, 'vetted_by'); }
}
