<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged implements ShouldBroadcast {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order, public string $oldStatus, public string $newStatus) {}

    public function broadcastOn(): Channel {
        return new Channel('notifications.' . $this->order->created_by);
    }

    public function broadcastAs(): string {
        return 'order.status_changed';
    }
}
