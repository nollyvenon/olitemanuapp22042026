<?php

use App\Http\Controllers\Reports\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('sales', [ReportController::class, 'salesReport']);
Route::get('inventory', [ReportController::class, 'inventoryReport']);
Route::get('accounts', [ReportController::class, 'accountsReport']);
