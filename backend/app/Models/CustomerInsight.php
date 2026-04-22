<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerInsight extends Model {
    use HasUuids;

    protected $fillable = ['customer_id', 'lifetime_value', 'avg_purchase_value', 'purchase_frequency', 'last_purchase_at', 'segment', 'behavior'];
    protected $casts = ['behavior' => 'json', 'last_purchase_at' => 'date'];

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
}
