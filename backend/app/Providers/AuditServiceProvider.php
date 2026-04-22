<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Group;
use App\Models\Order;
use App\Models\Voucher;
use App\Models\KycSubmission;
use App\Models\Territory;
use App\Models\PriceListVersion;
use App\Observers\AuditObserver;
use Illuminate\Support\ServiceProvider;

class AuditServiceProvider extends ServiceProvider {
    public function boot(): void {
        User::observe(AuditObserver::class);
        Group::observe(AuditObserver::class);
        Order::observe(AuditObserver::class);
        Voucher::observe(AuditObserver::class);
        KycSubmission::observe(AuditObserver::class);
        Territory::observe(AuditObserver::class);
        PriceListVersion::observe(AuditObserver::class);
    }
}
