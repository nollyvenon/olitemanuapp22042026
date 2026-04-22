<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OrderItem extends Model {
    use HasUuids;

    protected $fillable = ['order_id', 'product_name', 'sku', 'quantity', 'unit_price', 'total_price', 'notes'];

    protected $casts = ['unit_price' => 'decimal:2', 'total_price' => 'decimal:2'];

    public function order(): BelongsTo {
        return $this->belongsTo(Order::class);
    }
}
