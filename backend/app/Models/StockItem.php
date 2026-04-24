<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class StockItem extends Model {
    use HasUuids;
    protected $fillable = ['group_id', 'sku', 'name', 'description', 'unit_cost', 'reorder_level', 'unit', 'is_active', 'created_by'];
    protected $casts = ['unit_cost' => 'decimal:2', 'reorder_level' => 'decimal:2'];
    public function group() { return $this->belongsTo(StockGroup::class); }
    public function ledgers() { return $this->hasMany(StockLedger::class); }
    public function journals() { return $this->hasMany(StockJournal::class); }
}
