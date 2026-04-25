<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Versionable;

class Voucher extends Model {
    use HasUuids, Versionable, SoftDeletes;

    protected $fillable = ['voucher_number', 'ledger_id', 'created_by', 'override_by', 'override_reason', 'type', 'status', 'amount', 'currency', 'reference', 'notes', 'transaction_date', 'posted_at', 'reversed_at', 'reversal_of', 'version_number', 'parent_id', 'is_current'];

    protected $casts = ['amount' => 'decimal:2', 'transaction_date' => 'date'];

    public function ledger(): BelongsTo { return $this->belongsTo(LedgerAccount::class, 'ledger_id'); }
    public function entries(): HasMany { return $this->hasMany(LedgerEntry::class); }
    public function reversalOf(): BelongsTo { return $this->belongsTo(Voucher::class, 'reversal_of'); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
