<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEntry extends Model {
    use HasUuids;
    public $timestamps = false;

    protected $fillable = ['voucher_id', 'ledger_id', 'side', 'amount', 'description', 'created_at'];

    protected $casts = ['amount' => 'decimal:2'];

    public function voucher(): BelongsTo { return $this->belongsTo(Voucher::class); }
    public function ledger(): BelongsTo { return $this->belongsTo(LedgerAccount::class, 'ledger_id'); }
}
