<?php

use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Route;

Route::apiResource('users', UserController::class);
Route::post('users/{user}/assign-roles', [UserController::class, 'assignRoles']);
Route::post('users/{user}/assign-groups', [UserController::class, 'assignGroups']);
