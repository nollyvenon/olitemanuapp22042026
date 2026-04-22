<?php

namespace App\Jobs;

use App\Models\Sales\ApprovedOrder;
use App\Services\Notifications\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

class ProcessOrderApproval implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function __construct(public ApprovedOrder $order) {}

    public function handle(NotificationService $notificationService): void
    {
        $accountsGroup = \App\Models\Group::where('slug', 'accounts')->first();
        $notificationService->broadcastWorkflowNotification(
            $accountsGroup->id,
            'ApprovedOrder',
            $this->order->id,
            'authorization_required',
            ['order_number' => $this->order->order_number]
        );
    }
}
