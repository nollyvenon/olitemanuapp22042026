<?php

namespace App\Providers;

use App\Listeners\AuditEventListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \App\Events\UserLoggedIn::class => [
            AuditEventListener::class,
        ],
        \App\Events\StockLevelChanged::class => [
            AuditEventListener::class,
        ],
    ];

    protected $subscribe = [
        AuditEventListener::class,
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
