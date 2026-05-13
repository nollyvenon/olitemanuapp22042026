<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Customer extends Model {
    use HasUuids;

    protected $fillable = ['name', 'email', 'phone', 'company', 'address', 'city', 'state', 'country', 'status', 'ledger_category', 'created_by'];

    public function orders(): HasMany {
        return $this->hasMany(Order::class);
    }

    public function invoices(): HasMany {
        return $this->hasMany(Invoice::class);
    }

    public function creator(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }
}
