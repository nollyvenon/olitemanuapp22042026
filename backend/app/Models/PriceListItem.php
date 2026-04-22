<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceListItem extends Model {
    use HasUuids;
    public $timestamps = false;

    protected $fillable = ['version_id', 'item_id', 'price', 'min_qty', 'currency'];

    protected $casts = ['price' => 'decimal:2', 'min_qty' => 'decimal:2'];

    public function version(): BelongsTo { return $this->belongsTo(PriceListVersion::class, 'version_id'); }
    public function stockItem(): BelongsTo { return $this->belongsTo(StockItem::class, 'item_id'); }
}
