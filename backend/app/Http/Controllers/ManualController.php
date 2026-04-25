<?php

namespace App\Http\Controllers;

use App\Models\Manual;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ManualController {
    public function index(Request $request): JsonResponse {
        $query = Manual::query();
        $userRoles = $request->authUser->roles ?? [];

        if (!in_array('admin', $userRoles)) {
            $query->where(function($q) use ($userRoles) {
                $q->whereNull('roles_allowed')
                  ->orWhereJsonContains('roles_allowed', $userRoles);
            });
        }

        return response()->json($query->orderBy('module')->get());
    }

    public function show(string $id): JsonResponse {
        $manual = Manual::findOrFail($id);
        return response()->json($manual);
    }

    public function search(Request $request): JsonResponse {
        $query = $request->query('q', '');
        $userRoles = $request->authUser->roles ?? [];

        $results = Manual::where('title', 'like', "%$query%")
            ->orWhere('content', 'like', "%$query%");

        if (!in_array('admin', $userRoles)) {
            $results->where(function($q) use ($userRoles) {
                $q->whereNull('roles_allowed')
                  ->orWhereJsonContains('roles_allowed', $userRoles);
            });
        }

        return response()->json($results->get());
    }

    public function store(Request $request): JsonResponse {
        $v = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'module' => 'required|string',
            'slug' => 'required|unique:manuals',
            'roles_allowed' => 'array'
        ]);

        $manual = Manual::create([...$v, 'created_by' => $request->authUser->sub]);
        return response()->json($manual, 201);
    }

    public function update(Request $request, string $id): JsonResponse {
        $manual = Manual::findOrFail($id);
        $v = $request->validate([
            'title' => 'string',
            'content' => 'string',
            'module' => 'string',
            'roles_allowed' => 'array'
        ]);

        $manual->update($v);
        return response()->json($manual);
    }
}
