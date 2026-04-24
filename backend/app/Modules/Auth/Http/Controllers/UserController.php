<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController
{
    public function index(): JsonResponse
    {
        $users = User::with('groups', 'locations')->get();
        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:8',
                'group_ids' => 'nullable|array',
                'location_ids' => 'nullable|array',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password_hash' => bcrypt($validated['password']),
                'is_active' => true,
            ]);

            if (!empty($validated['group_ids'])) {
                $user->groups()->sync($validated['group_ids']);
            }

            if (!empty($validated['location_ids'])) {
                $user->locations()->sync($validated['location_ids']);
            }

            $user->load('groups', 'locations');
            return response()->json($user, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
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
            'group_ids' => 'sometimes|array|min:1',
        ]);

        $groupIds = $validated['group_ids'] ?? null;
        unset($validated['group_ids']);

        $user->update($validated);

        if ($groupIds !== null) {
            $user->groups()->sync($groupIds);
        }

        $user->load('groups', 'locations');
        return response()->json($user);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->noContent();
    }

    public function assignGroups(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validate(['group_ids' => 'required|array|min:1']);

        $user->groups()->sync($validated['group_ids']);
        return response()->json($user->load('groups'), 200);
    }

    public function assignLocations(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validate(['location_ids' => 'required|array|min:1']);

        $user->locations()->sync($validated['location_ids']);
        return response()->json($user->load('locations'), 200);
    }
}
