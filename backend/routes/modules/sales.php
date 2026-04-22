<?php use App\Http\Controllers\Sales\SalesOrderController; Route::post('orders', [SalesOrderController::class, 'store']); Route::get('orders', [SalesOrderController::class, 'list']);
