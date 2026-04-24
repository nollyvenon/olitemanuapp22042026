<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class StockCategory extends Model {
    use HasUuids;
    protected $fillable = ['name', 'description', 'created_by'];
    public function groups() { return $this->hasMany(StockGroup::class, 'category_id'); }
}
