<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(private InventoryService $inventoryService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search'),
            'is_active' => $request->boolean('is_active', null),
            'sort_by' => $request->query('sort_by', 'created_at'),
            'sort_order' => $request->query('sort_order', 'desc'),
            'page' => $request->integer('page', 1),
            'limit' => $request->integer('limit', 20),
        ];

        $paginated = $this->inventoryService->listProducts($filters);

        return response()->json([
            'data' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'page' => $paginated->currentPage(),
                'limit' => $paginated->perPage(),
                'pages' => $paginated->lastPage(),
            ],
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        if ($product->deleted_at) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sku' => 'required|string|unique:products',
            'name' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'min_stock_level' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $product = $this->inventoryService->createProduct($validated);

        return response()->json($product, 201);
    }

    public function update(Product $product, Request $request): JsonResponse
    {
        if ($product->deleted_at) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'min_stock_level' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $product = $this->inventoryService->updateProduct($product, $validated);

        return response()->json($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->deleted_at) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $this->inventoryService->deleteProduct($product);

        return response()->json(null, 204);
    }

    public function recordMovement(Product $product, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer',
            'reason' => 'sometimes|string',
        ]);

        $movement = $this->inventoryService->recordStockMovement(
            $product,
            $validated['type'],
            $validated['quantity'],
            $validated['reason'] ?? null
        );

        return response()->json($movement, 201);
    }

    public function movements(Product $product, Request $request): JsonResponse
    {
        $filters = [
            'type' => $request->query('type'),
            'page' => $request->integer('page', 1),
            'limit' => $request->integer('limit', 20),
        ];

        $paginated = $this->inventoryService->getStockMovements($product, $filters);

        return response()->json([
            'data' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'page' => $paginated->currentPage(),
                'limit' => $paginated->perPage(),
                'pages' => $paginated->lastPage(),
            ],
        ]);
    }

    public function lowStock(): JsonResponse
    {
        $products = $this->inventoryService->getLowStockProducts();

        return response()->json([
            'data' => $products,
            'count' => count($products),
        ]);
    }
}
