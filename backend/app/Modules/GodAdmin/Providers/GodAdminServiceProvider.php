<?php

namespace App\Modules\GodAdmin\Providers;

use App\Modules\GodAdmin\Services\GodAdminService;
use Illuminate\Support\ServiceProvider;

class GodAdminServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(GodAdminService::class, function ($app) {
            return new GodAdminService(
                $app->make(\App\Modules\Audit\Services\AuditService::class)
            );
        });
    }

    public function boot(): void
    {
        //
    }
}
