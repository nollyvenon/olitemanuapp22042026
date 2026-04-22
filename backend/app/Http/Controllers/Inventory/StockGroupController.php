<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class StockGroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockGroup::with('category', 'items');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|uuid|exists:stock_categories,id',
            'name' => 'required|string|unique:stock_groups',
            'code' => 'required|string|unique:stock_groups',
            'description' => 'nullable|string',
        ]);

        $group = StockGroup::create(['id' => Str::uuid(), ...$validated]);
        return response()->json($group->load('category'), 201);
    }

    public function show(StockGroup $group): JsonResponse
    {
        return response()->json($group->load('category', 'items'));
    }

    public function update(Request $request, StockGroup $group): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:stock_groups,name,' . $group->id . ',id',
            'code' => 'sometimes|string|unique:stock_groups,code,' . $group->id . ',id',
            'description' => 'nullable|string',
        ]);

        $group->update($validated);
        return response()->json($group->load('category', 'items'));
    }

    public function destroy(StockGroup $group): JsonResponse
    {
        if ($group->items()->exists()) {
            return response()->json(['message' => 'Cannot delete group with items'], 422);
        }

        $group->delete();
        return response()->json(null, 204);
    }
}
