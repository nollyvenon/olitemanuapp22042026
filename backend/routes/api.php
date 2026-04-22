<?php

use App\Modules\Auth\Http\Controllers\AuthController;
use App\Modules\Auth\Http\Controllers\GroupController;
use App\Modules\Auth\Http\Controllers\LocationController;
use App\Modules\Auth\Http\Controllers\PermissionController;
use App\Modules\Auth\Http\Controllers\UserController;
use App\Modules\Sales\Http\Controllers\CustomerController;
use App\Modules\Sales\Http\Controllers\InvoiceController;
use App\Modules\Sales\Http\Controllers\OrderController;
use App\Modules\Inventory\Http\Controllers\StockCategoryController;
use App\Modules\Inventory\Http\Controllers\StockItemController;
use App\Modules\Inventory\Http\Controllers\StockJournalController;
use App\Modules\Inventory\Http\Controllers\StockLedgerController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('password/request-reset', [AuthController::class, 'requestReset']);
        Route::post('password/reset', [AuthController::class, 'resetPassword']);

        Route::middleware('jwt')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
        });
    });

    Route::middleware('jwt')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/groups', [UserController::class, 'assignGroups']);
        Route::post('users/{id}/locations', [UserController::class, 'assignLocations']);

        Route::apiResource('groups', GroupController::class);
        Route::post('groups/{id}/permissions', [GroupController::class, 'attachPermissions']);
        Route::delete('groups/{id}/permissions/{pid}', [GroupController::class, 'detachPermission']);
        Route::post('groups/{id}/inherit', [GroupController::class, 'setInheritance']);

        Route::get('permissions', [PermissionController::class, 'index']);
        Route::get('locations', [LocationController::class, 'index']);
        Route::post('locations', [LocationController::class, 'store']);

        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('orders', OrderController::class);
        Route::post('invoices', [InvoiceController::class, 'store']);
        Route::get('invoices', [InvoiceController::class, 'index']);
        Route::get('invoices/{id}', [InvoiceController::class, 'show']);
        Route::patch('invoices/{id}/status', [InvoiceController::class, 'updateStatus']);

        Route::apiResource('stock/categories', StockCategoryController::class);
        Route::post('stock/categories/{id}/groups', [StockCategoryController::class, 'storeGroup']);
        Route::delete('stock/categories/{id}/groups/{gid}', [StockCategoryController::class, 'destroyGroup']);
        Route::apiResource('stock/items', StockItemController::class);
        Route::get('stock/ledger', [StockLedgerController::class, 'index']);
        Route::get('stock/ledger/{itemId}/balance', [StockLedgerController::class, 'itemBalance']);
        Route::get('stock/journals', [StockJournalController::class, 'index']);
        Route::post('stock/journals/add', [StockJournalController::class, 'add']);
        Route::post('stock/journals/transfer', [StockJournalController::class, 'transfer']);
        Route::post('stock/journals/remove', [StockJournalController::class, 'remove']);
    });
});
