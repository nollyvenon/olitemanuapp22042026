<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StockBalance extends Model {
    protected $fillable = ['item_id', 'store_center_id', 'quantity'];
    protected $casts = ['quantity' => 'decimal:2'];
    public function item() { return $this->belongsTo(StockItem::class); }
    public function storeCenter() { return $this->belongsTo(StoreCenter::class); }
}
