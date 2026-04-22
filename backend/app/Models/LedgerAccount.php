<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LedgerAccount extends Model {
    use HasUuids;

    protected $fillable = ['account_number', 'name', 'type', 'customer_id', 'location_id', 'territory_id', 'price_list_version_id', 'sales_officer_id', 'credit_limit', 'opening_balance', 'current_balance', 'is_active', 'created_by'];

    protected $casts = ['credit_limit' => 'decimal:2', 'opening_balance' => 'decimal:2', 'current_balance' => 'decimal:2'];

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function location(): BelongsTo { return $this->belongsTo(Location::class); }
    public function territory(): BelongsTo { return $this->belongsTo(Territory::class); }
    public function priceList(): BelongsTo { return $this->belongsTo(PriceListVersion::class, 'price_list_version_id'); }
    public function salesOfficer(): BelongsTo { return $this->belongsTo(User::class, 'sales_officer_id'); }
    public function vouchers(): HasMany { return $this->hasMany(Voucher::class, 'ledger_id'); }
    public function entries(): HasMany { return $this->hasMany(LedgerEntry::class, 'ledger_id'); }
}
