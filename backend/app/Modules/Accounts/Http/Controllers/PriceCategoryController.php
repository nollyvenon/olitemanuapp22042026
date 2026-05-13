<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\PriceCategory;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceCategoryController
{
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse
    {
        $categories = PriceCategory::orderBy('name')->paginate(20);
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:price_categories',
                'description' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $category = PriceCategory::create($validated);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'price_categories',
                'entity_id' => $category->id,
                'after_snapshot' => $category->toArray(),
            ]);

            return response()->json($category, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $category = PriceCategory::findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $category = PriceCategory::findOrFail($id);
            $before = $category->toArray();

            $validated = $request->validate([
                'name' => 'nullable|string|max:255|unique:price_categories,name,' . $id,
                'description' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $category->update($validated);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'price_categories',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $category->toArray(),
            ]);

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $category = PriceCategory::findOrFail($id);
            $before = $category->toArray();
            $category->delete();

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'DELETE',
                'entity_type' => 'price_categories',
                'entity_id' => $id,
                'before_snapshot' => $before,
            ]);

            return response()->noContent();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}