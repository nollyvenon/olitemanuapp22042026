<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLedger extends Model {
    use HasUuids;

    protected $fillable = ['item_id', 'location_id', 'quantity', 'last_counted_at', 'last_counted_by'];

    protected $casts = ['quantity' => 'decimal:2'];

    public function item(): BelongsTo {
        return $this->belongsTo(StockItem::class, 'item_id');
    }

    public function location(): BelongsTo {
        return $this->belongsTo(Location::class);
    }
}
