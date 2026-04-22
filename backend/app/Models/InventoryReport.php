<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryReport extends Model {
    use HasUuids;

    protected $fillable = ['type', 'location_id', 'item_id', 'category_id', 'report_date', 'quantity', 'unit_price', 'total_value', 'filters'];
    protected $casts = ['filters' => 'json', 'report_date' => 'date', 'quantity' => 'decimal:2', 'unit_price' => 'decimal:2', 'total_value' => 'decimal:2'];

    public function location(): BelongsTo { return $this->belongsTo(Location::class); }
    public function item(): BelongsTo { return $this->belongsTo(StockItem::class); }
    public function category(): BelongsTo { return $this->belongsTo(StockCategory::class); }
}
