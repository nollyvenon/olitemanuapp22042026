<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MarketTrend extends Model {
    use HasUuids;

    protected $fillable = ['category', 'metric', 'value', 'previous_value', 'change_percent', 'metadata'];
    protected $casts = ['metadata' => 'json'];
}
