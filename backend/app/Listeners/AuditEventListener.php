<?php

namespace App\Listeners;

use App\Models\AuditLog;
use Illuminate\Events\Dispatcher;

class AuditEventListener
{
    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            \App\Events\UserLoggedIn::class,
            [$this, 'onUserLoggedIn']
        );

        $events->listen(
            \App\Events\StockLevelChanged::class,
            [$this, 'onStockLevelChanged']
        );
    }

    public function onUserLoggedIn(\App\Events\UserLoggedIn $event): void
    {
        AuditLog::create([
            'actor_id' => $event->user->id,
            'actor_email' => $event->user->email,
            'action' => 'login',
            'module' => 'auth',
            'resource' => 'users',
            'resource_id' => $event->user->id,
            'ip_address' => $event->ipAddress,
            'user_agent' => $event->userAgent,
            'status_code' => 200,
        ]);
    }

    public function onStockLevelChanged(\App\Events\StockLevelChanged $event): void
    {
        AuditLog::create([
            'actor_id' => auth()->id(),
            'actor_email' => auth()->user()?->email,
            'action' => 'updated',
            'module' => 'inventory',
            'resource' => 'products',
            'resource_id' => $event->product->id,
            'old_values' => ['stock_quantity' => $event->previousQuantity],
            'new_values' => ['stock_quantity' => $event->newQuantity],
            'metadata' => ['reason' => $event->reason],
        ]);

        // If stock is low, send notification
        if ($event->newQuantity <= $event->product->min_stock_level) {
            \App\Jobs\SendNotification::dispatch(
                auth()->user(),
                'low_stock',
                [
                    'product_name' => $event->product->name,
                    'current_stock' => $event->newQuantity,
                    'min_level' => $event->product->min_stock_level,
                ]
            );
        }
    }
}
