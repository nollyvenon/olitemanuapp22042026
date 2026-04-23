<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        if (file_exists(base_path('routes/api.php'))) {
            Route::prefix('api')
                ->group(base_path('routes/api.php'));
        }

        if (file_exists(base_path('routes/web.php'))) {
            Route::group([], base_path('routes/web.php'));
        }
    }
}
