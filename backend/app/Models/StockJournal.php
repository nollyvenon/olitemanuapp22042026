<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StockJournal extends Model {
    protected $fillable = ['item_id', 'from_location', 'to_location', 'quantity', 'type', 'reference_type', 'reference_id', 'notes', 'created_by'];
    protected $casts = ['quantity' => 'decimal:2'];
    public function item() { return $this->belongsTo(StockItem::class); }
    public function fromLoc() { return $this->belongsTo(\App\Models\Location::class, 'from_location'); }
    public function toLoc() { return $this->belongsTo(\App\Models\Location::class, 'to_location'); }
}
