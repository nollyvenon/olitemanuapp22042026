<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StockJournalItem extends Model {
    protected $fillable = ['journal_id', 'item_id', 'quantity', 'unit_cost', 'notes'];
    protected $casts = ['quantity' => 'decimal:2', 'unit_cost' => 'decimal:2'];
    public function journal() { return $this->belongsTo(StockJournal::class); }
    public function item() { return $this->belongsTo(StockItem::class); }
}
