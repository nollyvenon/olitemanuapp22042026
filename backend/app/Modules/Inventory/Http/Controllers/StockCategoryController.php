<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Models\StockCategory;
use App\Models\StockGroup;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockCategoryController {
    public function __construct(private AuditService $auditService) {}

    public function index(): JsonResponse {
        return response()->json(StockCategory::with('groups.items')->get());
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate(['name' => 'required|string|unique:stock_categories', 'description' => 'nullable|string']);
            $category = StockCategory::create([...$validated, 'created_by' => $request->authUser->sub]);

            $this->auditService->log(['user_id' => $request->authUser->sub, 'action_type' => 'CREATE', 'entity_type' => 'stock_categories', 'entity_id' => $category->id, 'after_snapshot' => $category->toArray()]);

            return response()->json($category, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse {
        try {
            $category = StockCategory::findOrFail($id);
            $before = $category->toArray();
            $validated = $request->validate(['name' => 'nullable|string|unique:stock_categories,name,' . $id, 'description' => 'nullable|string']);
            $category->update($validated);

            $this->auditService->log(['user_id' => $request->authUser->sub, 'action_type' => 'UPDATE', 'entity_type' => 'stock_categories', 'entity_id' => $id, 'before_snapshot' => $before, 'after_snapshot' => $category->toArray()]);

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, string $id): JsonResponse {
        try {
            $category = StockCategory::findOrFail($id);
            if ($category->groups()->exists()) {
                return response()->json(['error' => 'Cannot delete category with existing groups'], 422);
            }
            $category->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storeGroup(Request $request, string $id): JsonResponse {
        try {
            $validated = $request->validate(['name' => 'required|string', 'description' => 'nullable|string']);
            $group = StockGroup::create([...$validated, 'category_id' => $id, 'created_by' => $request->authUser->sub]);
            return response()->json($group, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroyGroup(Request $request, string $id, string $gid): JsonResponse {
        try {
            $group = StockGroup::where('category_id', $id)->findOrFail($gid);
            if ($group->items()->exists()) {
                return response()->json(['error' => 'Cannot delete group with existing items'], 422);
            }
            $group->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
