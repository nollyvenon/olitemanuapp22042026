<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Payment extends Model {
    use HasUuids;

    protected $fillable = ['invoice_id', 'received_by', 'amount', 'method', 'reference', 'notes', 'paid_at'];

    protected $casts = ['amount' => 'decimal:2'];

    public function invoice(): BelongsTo {
        return $this->belongsTo(Invoice::class);
    }

    public function receivedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'received_by');
    }
}
