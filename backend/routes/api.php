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
use App\Modules\Reports\Http\Controllers\ExportController;
use App\Modules\Audit\Http\Controllers\AuditController;
use App\Modules\Notifications\Http\Controllers\NotificationController;
use App\Modules\MarketIntelligence\Http\Controllers\MarketIntelligenceController;
use App\Modules\MarketIntelligence\Http\Controllers\MarketPlanController;
use App\Modules\Reporting\Http\Controllers\InventoryReportController;
use App\Modules\Settings\Http\Controllers\SettingsController;
use App\Modules\Analytics\Http\Controllers\AnalyticsController;
use App\Modules\GodAdmin\Http\Controllers\GodAdminController;
use App\Http\Controllers\ManualController;
use App\Modules\Documentation\Http\Controllers\ManualController as DocManualController;
use App\Modules\Documentation\Http\Controllers\ManualSearchController;
use App\Modules\Documentation\Http\Controllers\AIAssistantController;
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
        Route::patch('orders/{id}/transition', [OrderController::class, 'transition']);
        Route::post('orders/{id}/documents', [OrderController::class, 'uploadDocuments']);
        Route::post('orders/{id}/authorize', [OrderController::class, 'authorize']);
        Route::post('orders/{id}/override', [OrderController::class, 'override']);
        Route::post('orders/{id}/invoices', [OrderController::class, 'createInvoice']);
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

        Route::apiResource('territories', TerritoryController::class);

        Route::get('kyc', [KycController::class, 'index']);
        Route::post('kyc', [KycController::class, 'store']);
        Route::get('kyc/{id}', [KycController::class, 'show']);
        Route::post('kyc/{id}/approve', [KycController::class, 'approve']);
        Route::post('kyc/{id}/reject', [KycController::class, 'reject']);

        Route::get('reports', [ReportController::class, 'index']);
        Route::post('reports', [ReportController::class, 'store']);
        Route::get('reports/inventory', [InventoryReportController::class, 'opening']);
        Route::get('reports/{id}', [ReportController::class, 'show']);
        Route::post('reports/{id}/generate', [ReportController::class, 'generate']);

        Route::post('export/excel', [ExportController::class, 'exportExcel']);
        Route::post('export/pdf', [ExportController::class, 'exportPDF']);

        Route::get('audit-logs', [AuditController::class, 'index']);
        Route::get('audit-logs/{id}', [AuditController::class, 'show']);
        Route::get('audit-logs/entity/{entityType}/{entityId}', [AuditController::class, 'entityAuditTrail']);
        Route::get('audit-logs/user/{userId}', [AuditController::class, 'userActions']);
        Route::get('audit-statistics', [AuditController::class, 'statistics']);
        Route::post('audit-logs/export', [AuditController::class, 'export']);

        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::get('notification-preferences', [NotificationController::class, 'preferences']);
        Route::patch('notification-preferences/{type}', [NotificationController::class, 'updatePreference']);

        Route::get('market/plans', [MarketPlanController::class, 'index']);
        Route::post('market/plans', [MarketPlanController::class, 'store']);
        Route::get('market/plans/{id}', [MarketPlanController::class, 'show']);
        Route::post('market/plans/{id}/vet', [MarketPlanController::class, 'vet']);

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

        Route::get('settings', [SettingsController::class, 'index']);
        Route::post('settings', [SettingsController::class, 'store']);
        Route::put('settings', [SettingsController::class, 'update']);

        Route::get('manuals', [ManualController::class, 'index']);
        Route::get('manuals/search', [ManualController::class, 'search']);
        Route::post('manuals', [ManualController::class, 'store']);
        Route::get('manuals/{id}', [ManualController::class, 'show']);
        Route::patch('manuals/{id}', [ManualController::class, 'update']);

        Route::prefix('analytics')->group(function () {
            Route::get('ai/insights', [AnalyticsController::class, 'aiInsights']);
            Route::get('ai/forecast', [AnalyticsController::class, 'aiForecast']);
            Route::get('ai/alerts', [AnalyticsController::class, 'aiAlerts']);

            Route::get('unified', [AnalyticsController::class, 'unified']);
            Route::get('unified/{module}', [AnalyticsController::class, 'unifiedModule']);
            Route::get('correlations', [AnalyticsController::class, 'crossModuleCorrelations']);
            Route::get('executive', [AnalyticsController::class, 'executive']);
            Route::get('sales', [AnalyticsController::class, 'sales']);
            Route::get('collections', [AnalyticsController::class, 'collections']);
            Route::get('inventory', [AnalyticsController::class, 'inventory']);
            Route::get('performance', [AnalyticsController::class, 'performance']);
            Route::get('revenue', [AnalyticsController::class, 'revenue']);
            Route::get('accounts-risk', [AnalyticsController::class, 'accountsRisk']);
            Route::get('sales-performance', [AnalyticsController::class, 'salesPerformance']);
            Route::get('insights', [AnalyticsController::class, 'insights']);
            Route::get('alerts', [AnalyticsController::class, 'alerts']);
            Route::get('forecast/sales', [AnalyticsController::class, 'salesForecast']);
            Route::get('forecast/inventory', [AnalyticsController::class, 'inventoryForecast']);
            Route::get('forecast/cashflow', [AnalyticsController::class, 'cashFlowForecast']);
            Route::get('audit/transactions', [AnalyticsController::class, 'auditTransactions']);
            Route::get('audit/activity', [AnalyticsController::class, 'auditActivity']);
            Route::get('audit/overrides', [AnalyticsController::class, 'auditOverrides']);
            Route::get('audit/suspicious', [AnalyticsController::class, 'auditSuspicious']);
        });

        Route::prefix('god-admin')->middleware('god_admin')->group(function () {
            Route::post('override', [GodAdminController::class, 'override']);
            Route::post('confirmations/{id}/confirm', [GodAdminController::class, 'confirmAction']);

            Route::post('impersonate', [GodAdminController::class, 'impersonate']);
            Route::post('force-transition', [GodAdminController::class, 'forceStateTransition']);

            Route::post('suspend-user/{id}', [GodAdminController::class, 'suspendUser']);
            Route::post('unsuspend-user/{id}', [GodAdminController::class, 'unsuspendUser']);

            Route::post('override-price', [GodAdminController::class, 'overridePriceOnOrder']);
            Route::post('override-inventory', [GodAdminController::class, 'overrideInventoryBalance']);

            Route::get('version-history/{entityType}/{entityId}', [GodAdminController::class, 'viewVersionHistory']);
            Route::get('audit-log', [GodAdminController::class, 'viewAuditLog']);
            Route::post('export-log', [GodAdminController::class, 'exportAuditLog']);
        });

        Route::prefix('documentation')->group(function () {
            Route::get('manuals', [DocManualController::class, 'index']);
            Route::get('manuals/{slug}', [DocManualController::class, 'show']);
            Route::post('manuals', [DocManualController::class, 'store']);
            Route::patch('manuals/{id}', [DocManualController::class, 'update']);
            Route::delete('manuals/{id}', [DocManualController::class, 'delete']);
            Route::post('manuals/{id}/feedback', [DocManualController::class, 'feedback']);
            Route::get('categories', [DocManualController::class, 'getCategories']);
            Route::get('search', [ManualSearchController::class, 'search']);
            Route::get('contextual-help', [DocManualController::class, 'getContextualHelp']);
            Route::post('ai-assistant', [AIAssistantController::class, 'answer']);
        });
    });
});
