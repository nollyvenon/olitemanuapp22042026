<?php

namespace App\Modules\Settings\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use App\Modules\Auth\Services\RBACService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController
{
    public function __construct(private RBACService $rbac) {}

    public function index(Request $request): JsonResponse
    {
        $user = User::find($request->authUser->sub ?? null);
        if ($user && !$this->rbac->canAccessModule($user, 'admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $settings = Setting::all(['key', 'value'])->mapWithKeys(fn($s) => [$s->key => $s->value]);
        return response()->json($settings);
    }

    public function store(Request $request): JsonResponse
    {
        $user = User::find($request->authUser->sub);
        if (!$this->rbac->hasPermission($user, 'admin.edit')) {
            return response()->json(['error' => 'Permission denied: admin.edit'], 403);
        }
        $data = $request->all();

        foreach ($data as $key => $value) {
            Setting::set($key, (string)$value, is_bool($value) ? 'boolean' : (is_numeric($value) ? 'integer' : 'string'));
        }

        return response()->json(['message' => 'Settings saved successfully'], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $user = User::find($request->authUser->sub);
        if (!$this->rbac->hasPermission($user, 'admin.edit')) {
            return response()->json(['error' => 'Permission denied: admin.edit'], 403);
        }
        $data = $request->all();

        foreach ($data as $key => $value) {
            Setting::set($key, (string)$value, is_bool($value) ? 'boolean' : (is_numeric($value) ? 'integer' : 'string'));
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
