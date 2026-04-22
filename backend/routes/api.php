<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

Route::prefix('v1')->group(function () {

    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Protected routes
    Route::middleware(['auth:api'])->group(function () {

        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::patch('/me', [AuthController::class, 'updateMe']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::delete('/logout-all', [AuthController::class, 'logoutAll']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
            Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
            Route::post('/admin/reset-password', [AuthController::class, 'adminResetPassword']);
        });

        // Module routes
        Route::prefix('users')->group(base_path('routes/modules/users.php'));
        Route::prefix('sales')->group(base_path('routes/modules/sales.php'));
        Route::prefix('accounts')->group(base_path('routes/modules/accounts.php'));
        Route::prefix('inventory')->group(base_path('routes/modules/inventory.php'));
        Route::prefix('kyc')->group(base_path('routes/modules/kyc.php'));
        Route::prefix('market')->group(base_path('routes/modules/market.php'));
        Route::prefix('reports')->group(base_path('routes/modules/reports.php'));
        Route::prefix('notifications')->group(base_path('routes/modules/notifications.php'));
        Route::prefix('audit')->group(base_path('routes/modules/audit.php'));
    });
});
