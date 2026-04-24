<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StockCategory extends Model {
    protected $fillable = ['name', 'description', 'created_by'];
    public function groups() { return $this->hasMany(StockGroup::class, 'category_id'); }
}
