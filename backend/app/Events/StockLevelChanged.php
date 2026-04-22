<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class StockLevelChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Product $product,
        public int $previousQuantity,
        public int $newQuantity,
        public string $reason,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('inventory'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'product_id' => $this->product->id,
            'sku' => $this->product->sku,
            'previous_quantity' => $this->previousQuantity,
            'new_quantity' => $this->newQuantity,
            'difference' => $this->newQuantity - $this->previousQuantity,
            'reason' => $this->reason,
        ];
    }
}
