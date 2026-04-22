<?php

namespace App\Services\Inventory;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Pagination\Paginator;

class InventoryService
{
    public function listProducts(array $filters = []): Paginator
    {
        $query = Product::whereNull('deleted_at');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $page = $filters['page'] ?? 1;
        $limit = $filters['limit'] ?? 20;

        return $query->paginate($limit, ['*'], 'page', $page);
    }

    public function getProductById(string $id): ?Product
    {
        return Product::whereNull('deleted_at')->find($id);
    }

    public function createProduct(array $data): Product
    {
        return Product::create([
            'sku' => $data['sku'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'stock_quantity' => $data['stock_quantity'] ?? 0,
            'min_stock_level' => $data['min_stock_level'] ?? 10,
            'is_active' => $data['is_active'] ?? true,
            'created_by' => auth()->id(),
        ]);
    }

    public function updateProduct(Product $product, array $data): Product
    {
        $product->update([
            'name' => $data['name'] ?? $product->name,
            'description' => $data['description'] ?? $product->description,
            'price' => $data['price'] ?? $product->price,
            'min_stock_level' => $data['min_stock_level'] ?? $product->min_stock_level,
            'is_active' => $data['is_active'] ?? $product->is_active,
            'updated_by' => auth()->id(),
        ]);

        return $product;
    }

    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }

    public function recordStockMovement(Product $product, string $type, int $quantity, ?string $reason = null): StockMovement
    {
        $movement = $product->stockMovements()->create([
            'type' => $type,
            'quantity' => $quantity,
            'reason' => $reason,
            'created_by' => auth()->id(),
        ]);

        // Update product stock
        if ($type === 'in') {
            $product->increment('stock_quantity', $quantity);
        } elseif ($type === 'out') {
            $product->decrement('stock_quantity', $quantity);
        } elseif ($type === 'adjustment') {
            $product->update(['stock_quantity' => $product->stock_quantity + $quantity]);
        }

        return $movement;
    }

    public function getStockMovements(Product $product, array $filters = []): Paginator
    {
        $query = $product->stockMovements();

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $query->orderBy('created_at', 'desc');

        $page = $filters['page'] ?? 1;
        $limit = $filters['limit'] ?? 20;

        return $query->paginate($limit, ['*'], 'page', $page);
    }

    public function getLowStockProducts(): array
    {
        return Product::whereNull('deleted_at')
            ->where('is_active', true)
            ->whereRaw('stock_quantity <= min_stock_level')
            ->get()
            ->toArray();
    }
}
