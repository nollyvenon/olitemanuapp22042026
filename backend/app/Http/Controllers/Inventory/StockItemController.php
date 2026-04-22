<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockCategory;
use App\Models\Inventory\StockGroup;
use App\Models\Inventory\StockItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class StockItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockItem::with('group.category');

        if ($request->has('group_id')) {
            $query->where('group_id', $request->group_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => 'required|uuid|exists:stock_groups,id',
            'name' => 'required|string|unique:stock_items',
            'code' => 'required|string|unique:stock_items',
            'description' => 'nullable|string',
            'unit_of_measure' => 'required|string',
            'reorder_level' => 'nullable|numeric|min:0',
        ]);

        $item = StockItem::create([
            'id' => Str::uuid(),
            ...$validated,
        ]);

        return response()->json($item->load('group.category'), 201);
    }

    public function show(StockItem $item): JsonResponse
    {
        return response()->json($item->load('group.category', 'ledgers.storeCenter'));
    }

    public function update(Request $request, StockItem $item): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:stock_items,name,' . $item->id . ',id',
            'code' => 'sometimes|string|unique:stock_items,code,' . $item->id . ',id',
            'description' => 'nullable|string',
            'unit_of_measure' => 'sometimes|string',
            'reorder_level' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $item->update($validated);
        return response()->json($item->load('group.category'));
    }

    public function destroy(StockItem $item): JsonResponse
    {
        if ($item->ledgers()->where('quantity', '>', 0)->exists()) {
            return response()->json(['message' => 'Cannot delete item with active stock'], 422);
        }

        $item->delete();
        return response()->json(null, 204);
    }
}
