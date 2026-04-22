<?php

namespace App\Providers;

use App\Events\VoucherPosted;
use App\Events\KycApproved;
use App\Events\OrderStatusChanged;
use App\Listeners\SendVoucherNotification;
use App\Listeners\SendKycNotification;
use App\Listeners\SendOrderNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider {
    protected $listen = [
        VoucherPosted::class => [SendVoucherNotification::class],
        KycApproved::class => [SendKycNotification::class],
        OrderStatusChanged::class => [SendOrderNotification::class],
    ];

    public function boot(): void {}
}
