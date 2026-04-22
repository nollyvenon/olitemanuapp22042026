<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockItem extends Model {
    use HasUuids;

    protected $fillable = ['group_id', 'sku', 'name', 'description', 'reorder_level', 'unit', 'unit_cost', 'is_active', 'created_by'];

    protected $casts = ['reorder_level' => 'decimal:2', 'unit_cost' => 'decimal:2', 'is_active' => 'boolean'];

    public function group(): BelongsTo {
        return $this->belongsTo(StockGroup::class, 'group_id');
    }

    public function ledgers(): HasMany {
        return $this->hasMany(StockLedger::class, 'item_id');
    }

    public function journals(): HasMany {
        return $this->hasMany(StockJournal::class, 'item_id');
    }

    public function getStockAt(string $locationId): float {
        return (float) $this->ledgers()->where('location_id', $locationId)->value('quantity') ?? 0;
    }

    public function getTotalStock(): float {
        return (float) $this->ledgers()->sum('quantity');
    }
}
