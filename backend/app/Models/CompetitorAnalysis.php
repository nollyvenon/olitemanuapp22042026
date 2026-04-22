<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitorAnalysis extends Model {
    use HasUuids;

    protected $fillable = ['competitor_name', 'products', 'pricing', 'notes', 'last_updated_at', 'updated_by'];
    protected $casts = ['products' => 'json', 'pricing' => 'json', 'last_updated_at' => 'datetime'];

    public function updatedBy(): BelongsTo { return $this->belongsTo(User::class, 'updated_by'); }
}
