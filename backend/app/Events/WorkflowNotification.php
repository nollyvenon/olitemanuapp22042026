<?php
namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkflowNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $message,
        public string $type,
        public array $data,
        public string $groupId,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("group.{$this->groupId}")];
    }

    public function broadcastAs(): string
    {
        return 'workflow.notification';
    }
}
