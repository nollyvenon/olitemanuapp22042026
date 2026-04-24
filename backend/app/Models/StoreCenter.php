<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StoreCenter extends Model {
    protected $table = 'store_centers';
    protected $fillable = ['name', 'address', 'city', 'state', 'country', 'is_active', 'created_by'];
    public function balances() { return $this->hasMany(StockBalance::class); }
    public function journals() { return $this->hasMany(StockJournal::class); }
}
