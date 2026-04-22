<?php

use App\Http\Controllers\Notifications\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function () {
    Route::get('/', [NotificationController::class, 'getGroupNotifications']);
    Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/{notification}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
});
