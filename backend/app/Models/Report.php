<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model {
    use HasUuids;

    protected $fillable = ['name', 'type', 'description', 'filters', 'columns', 'created_by'];
    protected $casts = ['filters' => 'json', 'columns' => 'json'];

    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function schedules(): HasMany { return $this->hasMany(ReportSchedule::class); }
}
