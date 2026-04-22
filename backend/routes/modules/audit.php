<?php

use App\Http\Controllers\Audit\AuditController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api'])->group(function () {
    Route::get('/', [AuditController::class, 'list']);
    Route::get('/{auditLog}', [AuditController::class, 'show']);
    Route::get('/export', [AuditController::class, 'export']);
});
