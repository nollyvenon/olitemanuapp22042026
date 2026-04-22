<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Models\StockItem;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockItemController {
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $items = StockItem::with('group.category')->where('is_active', true)->paginate(20);
        return response()->json($items);
    }

    public function show(Request $request, string $id): JsonResponse {
        $item = StockItem::with('group.category', 'ledgers.location')->findOrFail($id);
        return response()->json($item);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'group_id' => 'required|uuid|exists:stock_groups,id',
                'sku' => 'required|string|unique:stock_items',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'reorder_level' => 'nullable|numeric|min:0',
                'unit' => 'nullable|string|max:50',
                'unit_cost' => 'required|numeric|min:0',
            ]);

            $item = StockItem::create([...$validated, 'created_by' => $request->authUser->sub]);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'stock_items',
                'entity_id' => $item->id,
                'after_snapshot' => $item->toArray(),
            ]);

            return response()->json($item->load('group.category'), 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse {
        try {
            $item = StockItem::findOrFail($id);
            $before = $item->toArray();

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'reorder_level' => 'nullable|numeric|min:0',
                'unit' => 'nullable|string|max:50',
                'unit_cost' => 'nullable|numeric|min:0',
                'is_active' => 'nullable|boolean',
            ]);

            $item->update($validated);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'stock_items',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $item->toArray(),
            ]);

            return response()->json($item);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, string $id): JsonResponse {
        try {
            $item = StockItem::findOrFail($id);

            if ($item->ledgers()->where('quantity', '>', 0)->exists()) {
                return response()->json(['error' => 'Cannot delete item with existing stock'], 422);
            }

            if ($item->journals()->exists()) {
                return response()->json(['error' => 'Cannot delete item with stock history'], 422);
            }

            $item->delete();

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'DELETE',
                'entity_type' => 'stock_items',
                'entity_id' => $id,
                'before_snapshot' => $item->toArray(),
            ]);

            return response()->json(['message' => 'Item deleted']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
