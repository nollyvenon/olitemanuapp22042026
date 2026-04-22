<?php

namespace App\Events;

use App\Models\KycSubmission;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KycApproved implements ShouldBroadcast {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public KycSubmission $submission, public string $userId) {}

    public function broadcastOn(): Channel {
        return new Channel('notifications.' . $this->userId);
    }

    public function broadcastAs(): string {
        return 'kyc.approved';
    }
}
