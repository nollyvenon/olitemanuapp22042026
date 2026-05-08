<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManualFeedback extends Model {
    use HasUuids;
    protected $fillable = ['manual_id', 'user_id', 'rating', 'comment'];
    public function manual(): BelongsTo { return $this->belongsTo(Manual::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
