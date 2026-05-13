<?php namespace App\Modules\Inventory\Http\Controllers;
use App\Models\StockItem;
use App\Models\StockGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StockItemController {
    public function index(): JsonResponse {
        return response()->json(StockItem::with('group')->where('is_active', true)->get());
    }
    public function store(Request $request): JsonResponse {
        $v = $request->validate(['group_id' => 'required|uuid|exists:stock_groups,id', 'sku' => 'required|unique:stock_items', 'name' => 'required|string', 'unit_cost' => 'numeric|min:0', 'reorder_level' => 'numeric|min:0', 'unit' => 'string']);
        return response()->json(StockItem::create([...$v, 'created_by' => $request->authUser->sub]), 201);
    }
    public function show(string $id): JsonResponse {
        return response()->json(StockItem::with('group', 'ledgers.location')->findOrFail($id));
    }
    public function update(Request $request, string $id): JsonResponse {
        $item = StockItem::findOrFail($id);
        $v = $request->validate(['group_id' => 'sometimes|uuid|exists:stock_groups,id', 'name' => 'string', 'description' => 'string', 'unit' => 'string', 'unit_cost' => 'numeric|min:0', 'reorder_level' => 'numeric|min:0', 'is_active' => 'boolean']);
        return response()->json($item->update($v) ? $item->refresh() : $item);
    }
    public function destroy(Request $request, string $id): JsonResponse {
        StockItem::findOrFail($id)->delete();
        return response()->noContent();
    }
}
