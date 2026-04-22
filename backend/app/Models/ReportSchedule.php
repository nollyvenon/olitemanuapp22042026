<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportSchedule extends Model {
    use HasUuids;

    protected $fillable = ['report_id', 'frequency', 'recipients', 'is_active', 'last_run_at', 'next_run_at'];
    protected $casts = ['recipients' => 'json', 'last_run_at' => 'datetime', 'next_run_at' => 'datetime'];

    public function report(): BelongsTo { return $this->belongsTo(Report::class); }
}
