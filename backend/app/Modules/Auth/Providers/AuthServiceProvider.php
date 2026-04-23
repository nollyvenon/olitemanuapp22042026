<?php

namespace App\Modules\Auth\Providers;

use App\Modules\Auth\Services\AuthService;
use App\Modules\Auth\Services\DeviceService;
use App\Modules\Auth\Services\GroupService;
use App\Modules\Auth\Services\IpGeolocationService;
use App\Modules\Auth\Services\JwtService;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->app->singleton(JwtService::class, function () {
            return new JwtService();
        });

        $this->app->singleton(GroupService::class, function () {
            return new GroupService();
        });

        $this->app->singleton(DeviceService::class, function () {
            return new DeviceService();
        });

        $this->app->singleton(IpGeolocationService::class, function () {
            return new IpGeolocationService();
        });

        $this->app->singleton(AuthService::class, function ($app) {
            return new AuthService(
                $app->make(JwtService::class),
                $app->make(GroupService::class),
                $app->make(DeviceService::class),
                $app->make(IpGeolocationService::class),
                $app->make(AuditService::class)
            );
        });
    }
}
