<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PriceListVersion extends Model {
    use HasUuids;

    protected $fillable = ['name', 'version', 'status', 'is_current', 'uploaded_by', 'approved_by', 'effective_from', 'effective_to'];

    protected $casts = ['is_current' => 'boolean'];

    public function items(): HasMany { return $this->hasMany(PriceListItem::class, 'version_id'); }
    public function uploader(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }
}
