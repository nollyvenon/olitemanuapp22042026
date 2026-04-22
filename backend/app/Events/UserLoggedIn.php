<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class UserLoggedIn implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public User $user,
        public ?string $ipAddress = null,
        public ?string $userAgent = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('auth'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.logged-in';
    }
}
