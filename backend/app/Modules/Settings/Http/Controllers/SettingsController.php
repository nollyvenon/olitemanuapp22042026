<?php

namespace App\Modules\Settings\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController
{
    public function index(): JsonResponse
    {
        $settings = Setting::all(['key', 'value'])->mapWithKeys(fn($s) => [$s->key => $s->value]);
        return response()->json($settings);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            Setting::set($key, (string)$value, is_bool($value) ? 'boolean' : (is_numeric($value) ? 'integer' : 'string'));
        }

        return response()->json(['message' => 'Settings saved successfully'], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            Setting::set($key, (string)$value, is_bool($value) ? 'boolean' : (is_numeric($value) ? 'integer' : 'string'));
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
