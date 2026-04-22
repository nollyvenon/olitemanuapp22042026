<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Territory extends Model {
    use HasUuids;

    protected $fillable = ['name', 'description', 'created_by'];

    public function ledgers(): HasMany { return $this->hasMany(LedgerAccount::class); }
}
