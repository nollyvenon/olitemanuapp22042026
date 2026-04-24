<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'description'];
    protected $casts = ['created_at' => 'datetime', 'updated_at' => 'datetime'];

    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set($key, $value, $type = 'string', $description = null): Model
    {
        return self::updateOrCreate(['key' => $key], ['value' => $value, 'type' => $type, 'description' => $description]);
    }
}
