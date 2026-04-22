<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoice extends Model {
    use HasUuids;
    use SoftDeletes;


    protected $fillable = ['invoice_number', 'order_id', 'customer_id', 'issued_by', 'status', 'subtotal', 'tax', 'total', 'invoice_date', 'due_date', 'paid_at', 'notes'];

    protected $casts = ['subtotal' => 'decimal:2', 'tax' => 'decimal:2', 'total' => 'decimal:2'];

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
        return $this->hasMany(Payment::class);
    }

    public function issuedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
