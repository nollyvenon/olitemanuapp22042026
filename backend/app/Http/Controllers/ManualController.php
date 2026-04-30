<?php

namespace App\Http\Controllers;

use App\Models\Manual;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ManualController {
    public function index(Request $request): JsonResponse {
        $query = Manual::query();
        $userRole = $request->authUser->role ?? 'user';

        if ($userRole !== 'admin') {
            $query->where(function($q) use ($userRole) {
                $q->whereNull('roles_allowed')
                  ->orWhereJsonContains('roles_allowed', $userRole);
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
        $userRole = $request->authUser->role ?? 'user';

        $results = Manual::where('title', 'like', "%$query%")
            ->orWhere('content', 'like', "%$query%");

        if ($userRole !== 'admin') {
            $results->where(function($q) use ($userRole) {
                $q->whereNull('roles_allowed')
                  ->orWhereJsonContains('roles_allowed', $userRole);
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
