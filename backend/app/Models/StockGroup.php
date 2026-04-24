<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StockGroup extends Model {
    protected $fillable = ['category_id', 'name', 'description', 'created_by'];
    public function category() { return $this->belongsTo(StockCategory::class); }
    public function items() { return $this->hasMany(StockItem::class, 'group_id'); }
}
