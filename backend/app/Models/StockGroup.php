<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class StockGroup extends Model {
    use HasUuids;
    protected $fillable = ['category_id', 'name', 'description', 'created_by'];
    public function category() { return $this->belongsTo(StockCategory::class); }
    public function items() { return $this->hasMany(StockItem::class, 'group_id'); }
}
