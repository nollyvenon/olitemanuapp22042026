<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class StockJournal extends Model {
    use HasUuids;
    protected $fillable = ['item_id', 'from_location', 'to_location', 'quantity', 'type', 'reference_type', 'reference_id', 'notes', 'journal_date', 'created_by'];
    protected $casts = ['quantity' => 'decimal:2', 'journal_date' => 'date'];
    public function item() { return $this->belongsTo(StockItem::class); }
    public function fromLoc() { return $this->belongsTo(\App\Models\Location::class, 'from_location'); }
    public function toLoc() { return $this->belongsTo(\App\Models\Location::class, 'to_location'); }
}
