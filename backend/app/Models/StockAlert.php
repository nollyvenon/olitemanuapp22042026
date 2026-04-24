<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StockAlert extends Model {
    protected $fillable = ['item_id', 'location_id', 'alert_type', 'is_resolved', 'resolved_by', 'resolved_at'];
    protected $casts = ['is_resolved' => 'boolean', 'resolved_at' => 'datetime'];
    public function item() { return $this->belongsTo(StockItem::class); }
    public function location() { return $this->belongsTo(\App\Models\Location::class); }
}
