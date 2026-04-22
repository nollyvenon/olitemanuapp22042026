<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Notification extends Model
    use HasUuids;
{
    use HasFactory;


    protected $fillable = [
        'group_id',
        'type',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'json',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }
}
