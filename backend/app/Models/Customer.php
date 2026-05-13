<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Group;

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

    public function viewGroups(): BelongsToMany {
        return $this->belongsToMany(Group::class, 'customer_group_views', 'customer_id', 'group_id');
    }
}
