<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockJournal extends Model {
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['item_id', 'from_location', 'to_location', 'quantity', 'type', 'reference_type', 'reference_id', 'notes', 'created_by', 'created_at'];

    protected $casts = ['quantity' => 'decimal:2'];

    public function item(): BelongsTo {
        return $this->belongsTo(StockItem::class, 'item_id');
    }

    public function fromLocation(): BelongsTo {
        return $this->belongsTo(Location::class, 'from_location');
    }

    public function toLocation(): BelongsTo {
        return $this->belongsTo(Location::class, 'to_location');
    }
}
