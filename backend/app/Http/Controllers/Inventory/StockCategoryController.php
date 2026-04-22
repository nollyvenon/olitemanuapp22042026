<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class StockCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(StockCategory::with('groups')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:stock_categories',
            'code' => 'required|string|unique:stock_categories',
            'description' => 'nullable|string',
        ]);

        $category = StockCategory::create(['id' => Str::uuid(), ...$validated]);
        return response()->json($category, 201);
    }

    public function show(StockCategory $category): JsonResponse
    {
        return response()->json($category->load('groups'));
    }

    public function update(Request $request, StockCategory $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:stock_categories,name,' . $category->id . ',id',
            'code' => 'sometimes|string|unique:stock_categories,code,' . $category->id . ',id',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);
        return response()->json($category->load('groups'));
    }

    public function destroy(StockCategory $category): JsonResponse
    {
        if ($category->groups()->exists()) {
            return response()->json(['message' => 'Cannot delete category with groups'], 422);
        }

        $category->delete();
        return response()->json(null, 204);
    }
}
