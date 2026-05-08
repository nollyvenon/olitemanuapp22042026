<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManualPermission extends Model {
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['manual_id', 'role_id', 'group_id', 'visibility'];
    public function manual(): BelongsTo { return $this->belongsTo(Manual::class); }
    public function role(): BelongsTo { return $this->belongsTo(Role::class); }
    public function group(): BelongsTo { return $this->belongsTo(Group::class); }
}
