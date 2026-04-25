<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoice extends Model {
    use HasUuids;

    protected $fillable = [
        'invoice_number',
        'order_id',
        'customer_id',
        'issued_by',
        'invoice_date',
        'due_date',
        'status',
        'subtotal',
        'tax',
        'total',
        'paid_at',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function order(): BelongsTo {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany {
        return $this->hasMany(InvoicePayment::class);
    }

    public function issuedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
