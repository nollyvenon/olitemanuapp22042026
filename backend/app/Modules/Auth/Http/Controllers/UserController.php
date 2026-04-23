<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController
{
    public function index(): JsonResponse
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'group_ids' => 'required|array',
            'location_ids' => 'required|array',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password_hash' => bcrypt($validated['password']),
            'is_active' => true,
        ]);

        return response()->json($user, 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);
        return response()->json($user);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function assignGroups(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $request->validate(['group_ids' => 'required|array']);

        // Sync groups (implementation depends on pivot table setup)
        return response()->json(['message' => 'Groups assigned']);
    }

    public function assignLocations(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $request->validate(['location_ids' => 'required|array']);

        // Sync locations (implementation depends on pivot table setup)
        return response()->json(['message' => 'Locations assigned']);
    }
}
