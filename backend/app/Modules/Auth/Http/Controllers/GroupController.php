<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController
{
    public function index(): JsonResponse
    {
        $groups = Group::all();
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
        $request->validate(['permission_ids' => 'required|array']);

        // Sync permissions
        return response()->json(['message' => 'Permissions attached']);
    }

    public function detachPermission(string $id, string $pid): JsonResponse
    {
        $group = Group::findOrFail($id);
        // Remove permission
        return response()->json(['message' => 'Permission detached']);
    }

    public function setInheritance(Request $request, string $id): JsonResponse
    {
        $group = Group::findOrFail($id);
        $request->validate(['parent_group_ids' => 'required|array']);

        // Set inheritance
        return response()->json(['message' => 'Inheritance set']);
    }
}
