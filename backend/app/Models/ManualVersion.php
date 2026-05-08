<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManualVersion extends Model {
    use HasUuids;
    protected $fillable = ['manual_id', 'version_number', 'content', 'created_by', 'change_notes'];
    public function manual(): BelongsTo { return $this->belongsTo(Manual::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
