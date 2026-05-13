<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Models\Location;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController
{
    public function index(Request $request): JsonResponse
    {
        $auth = $request->authUser ?? null;
        if ($auth && isset($auth->sub)) {
            $u = User::with('locations')->find($auth->sub);
            if ($u && !empty($u->is_god_admin)) {
                return response()->json(Location::all());
            }
            if ($u && $u->locations->isNotEmpty()) {
                return response()->json($u->locations->values());
            }
        }
        return response()->json(Location::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'long' => 'nullable|numeric',
        ]);

        $location = Location::create($validated);
        return response()->json($location, 201);
    }
}
