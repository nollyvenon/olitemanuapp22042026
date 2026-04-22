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
use App\Modules\Accounts\Http\Controllers\LedgerController;
use App\Modules\Accounts\Http\Controllers\VoucherController;
use App\Modules\Accounts\Http\Controllers\PriceListController;
use App\Modules\Accounts\Http\Controllers\TerritoryController;
use App\Modules\Kyc\Http\Controllers\KycController;
use App\Modules\Reports\Http\Controllers\ReportController;
use App\Modules\Audit\Http\Controllers\AuditController;
use App\Modules\Notifications\Http\Controllers\NotificationController;
use App\Modules\MarketIntelligence\Http\Controllers\MarketIntelligenceController;
use App\Modules\Reporting\Http\Controllers\InventoryReportController;
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

        Route::apiResource('ledgers', LedgerController::class)->except(['destroy']);
        Route::get('ledgers/{id}/statement', [LedgerController::class, 'statement']);

        Route::get('vouchers', [VoucherController::class, 'index']);
        Route::post('vouchers', [VoucherController::class, 'store']);
        Route::get('vouchers/{id}', [VoucherController::class, 'show']);
        Route::post('vouchers/{id}/reverse', [VoucherController::class, 'reverse']);

        Route::get('price-lists', [PriceListController::class, 'index']);
        Route::post('price-lists', [PriceListController::class, 'upload']);
        Route::get('price-lists/price', [PriceListController::class, 'price']);
        Route::get('price-lists/{id}', [PriceListController::class, 'show']);
        Route::post('price-lists/{id}/activate', [PriceListController::class, 'activate']);

        Route::apiResource('territories', TerritoryController::class)->except(['destroy']);

        Route::get('kyc', [KycController::class, 'index']);
        Route::post('kyc', [KycController::class, 'store']);
        Route::get('kyc/{id}', [KycController::class, 'show']);
        Route::post('kyc/{id}/approve', [KycController::class, 'approve']);
        Route::post('kyc/{id}/reject', [KycController::class, 'reject']);

        Route::get('reports', [ReportController::class, 'index']);
        Route::post('reports', [ReportController::class, 'store']);
        Route::get('reports/{id}', [ReportController::class, 'show']);
        Route::post('reports/{id}/generate', [ReportController::class, 'generate']);

        Route::get('audit-logs', [AuditController::class, 'index']);
        Route::get('audit-logs/{id}', [AuditController::class, 'show']);

        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::get('notification-preferences', [NotificationController::class, 'preferences']);
        Route::patch('notification-preferences/{type}', [NotificationController::class, 'updatePreference']);

        Route::get('market/trends', [MarketIntelligenceController::class, 'trends']);
        Route::get('market/competitors', [MarketIntelligenceController::class, 'competitors']);
        Route::patch('market/competitors/{id}', [MarketIntelligenceController::class, 'updateCompetitor']);
        Route::get('market/customer-insights', [MarketIntelligenceController::class, 'customerInsights']);
        Route::post('market/refresh-insights/{customerId}', [MarketIntelligenceController::class, 'refreshInsights']);

        Route::get('inventory-reports/opening', [InventoryReportController::class, 'opening']);
        Route::get('inventory-reports/inwards', [InventoryReportController::class, 'inwards']);
        Route::get('inventory-reports/outwards', [InventoryReportController::class, 'outwards']);
        Route::get('inventory-reports/closing', [InventoryReportController::class, 'closing']);
        Route::post('inventory-reports/export', [InventoryReportController::class, 'exportReport']);
    });
});
