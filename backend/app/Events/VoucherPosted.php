<?php

namespace App\Events;

use App\Models\Voucher;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoucherPosted implements ShouldBroadcast {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Voucher $voucher, public string $userId) {}

    public function broadcastOn(): Channel {
        return new Channel('notifications.' . $this->userId);
    }

    public function broadcastAs(): string {
        return 'voucher.posted';
    }
}
