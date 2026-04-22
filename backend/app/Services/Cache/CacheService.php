<?php

namespace App\Services\Cache;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    public function remember(string $key, int $ttl, callable $callback) { return Cache::remember($key, $ttl, $callback); }
    public function forget(string $key): bool { return Cache::forget($key); }
    public function flush(): bool { return Cache::flush(); }
    public function getUserPermissions(string $userId) { return $this->remember("perms:{$userId}", 3600, fn() => auth()->user()?->getAllPermissions()); }
    public function getProduct(string $productId) { return $this->remember("product:{$productId}", 7200, fn() => \App\Models\Inventory\StockItem::find($productId)); }
    public function invalidateUserCache(string $userId): void { $this->forget("perms:{$userId}"); }
    public function invalidateProductCache(string $productId): void { $this->forget("product:{$productId}"); }
}
