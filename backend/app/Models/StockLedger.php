<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StockLedger extends Model {
    protected $fillable = ['item_id', 'location_id', 'quantity', 'last_counted_at', 'last_counted_by'];
    protected $casts = ['quantity' => 'decimal:2', 'last_counted_at' => 'datetime'];
    public function item() { return $this->belongsTo(StockItem::class, 'item_id'); }
    public function location() { return $this->belongsTo(\App\Models\Location::class); }
}
