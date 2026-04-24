<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController
{
    public function index(): JsonResponse
    {
        $groups = Group::withCount('users')->with('permissions')->get();
        return response()->json($groups);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:groups|max:255',
            'description' => 'nullable|string',
        ]);

        $group = Group::create($validated);
        return response()->json($group, 201);
    }

    public function show(string $id): JsonResponse
    {
        $group = Group::findOrFail($id);
        return response()->json($group);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $group = Group::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:groups,name,' . $id,
            'description' => 'sometimes|string',
        ]);

        $group->update($validated);
        return response()->json($group);
    }

    public function attachPermissions(Request $request, string $id): JsonResponse
    {
        $group = Group::findOrFail($id);
        $validated = $request->validate(['permission_ids' => 'required|array|min:1']);

        $group->permissions()->sync($validated['permission_ids']);
        return response()->json($group->load('permissions'), 200);
    }

    public function detachPermission(string $id, string $pid): JsonResponse
    {
        $group = Group::findOrFail($id);
        $group->permissions()->detach($pid);
        return response()->json(['message' => 'Permission removed'], 200);
    }

    public function setInheritance(Request $request, string $id): JsonResponse
    {
        $group = Group::findOrFail($id);
        $validated = $request->validate(['parent_group_ids' => 'nullable|array']);

        $group->parentGroups()->sync($validated['parent_group_ids'] ?? []);
        return response()->json($group->load('parentGroups'), 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $group = Group::findOrFail($id);
        $group->delete();
        return response()->noContent();
    }
}
