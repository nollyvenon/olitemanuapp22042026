<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Versionable;

class Order extends Model {
    use HasUuids, SoftDeletes, Versionable;


    protected $fillable = ['order_number', 'customer_id', 'created_by', 'status', 'subtotal', 'tax', 'total', 'notes', 'order_date', 'expected_delivery', 'completed_at', 'form_status', 'version_number', 'parent_id', 'is_current', 'tally_invoice_path', 'delivery_note_path'];

    public function customer(): BelongsTo {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne {
        return $this->hasOne(Invoice::class);
    }

    public function creator(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }
}
