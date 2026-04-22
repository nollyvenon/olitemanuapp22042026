<?php use Illuminate\Support\Facades\Route; Route::post('/', fn() => response()->json(['status' => 'ok'])); Route::get('/', fn() => response()->json([]));
