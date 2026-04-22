<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use App\Models\Notification;
use App\Models\NotificationPreference;

class SendOrderNotification {
    public function handle(OrderStatusChanged $event): void {
        $pref = NotificationPreference::firstOrCreate(['user_id' => $event->order->created_by, 'type' => 'order'], ['email' => true, 'in_app' => true]);
        if ($pref->in_app) {
            Notification::create([
                'user_id' => $event->order->created_by,
                'type' => 'order',
                'title' => 'Order Status Updated',
                'message' => 'Order ' . $event->order->order_number . ' status changed to ' . $event->newStatus,
                'data' => ['order_id' => $event->order->id, 'status' => $event->newStatus],
            ]);
        }
    }
}
