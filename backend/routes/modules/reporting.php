<?php
use App\Http\Controllers\Reporting\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('inventory', [ReportController::class, 'inventoryReport']);
Route::get('inventory/movements', [ReportController::class, 'detailedMovements']);
Route::post('inventory/export', [ReportController::class, 'exportInventoryReport']);
