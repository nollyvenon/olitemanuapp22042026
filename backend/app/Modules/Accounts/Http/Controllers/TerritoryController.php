<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\Territory;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TerritoryController {
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $territories = Territory::withCount('ledgers')
            ->orderBy('name')
            ->paginate(50);

        return response()->json($territories);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:territories',
                'description' => 'nullable|string',
            ]);

            $validated['created_by'] = $request->authUser->sub;

            $territory = Territory::create($validated);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'territories',
                'entity_id' => $territory->id,
                'after_snapshot' => $territory->toArray(),
            ]);

            return response()->json($territory, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse {
        $territory = Territory::with('ledgers')->findOrFail($id);
        return response()->json($territory);
    }

    public function update(Request $request, string $id): JsonResponse {
        try {
            $territory = Territory::findOrFail($id);
            $before = $territory->toArray();

            $validated = $request->validate([
                'name' => 'nullable|string|max:255|unique:territories,name,' . $id,
                'description' => 'nullable|string',
            ]);

            $territory->update($validated);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'territories',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $territory->toArray(),
            ]);

            return response()->json($territory);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
