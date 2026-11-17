<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\StageController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('assets/app.css', fn () => response()->file(public_path('admin/app.css'), ['Content-Type' => 'text/css; charset=utf-8']))->name('css');
    Route::get('assets/app.js', fn () => response()->file(public_path('admin/app.js'), ['Content-Type' => 'application/javascript; charset=utf-8']))->name('js');
    Route::get('assets/{font}.woff2', fn (string $font) => response()->file(public_path('admin/'.$font.'.woff2'), ['Content-Type' => 'font/woff2']))->where('font', 'serif-normal|serif-italic');
    Route::get('login', [AdminAuthController::class, 'create'])->name('login');
    Route::post('login', [AdminAuthController::class, 'store'])->middleware('throttle:login')->name('authenticate');
    Route::post('logout', [AdminAuthController::class, 'destroy'])->name('logout');
    Route::middleware('admin.access:control-stage')->group(function () {
        Route::get('stage', [StageController::class, 'index'])->name('stage');
        Route::get('stage/preview', [StageController::class, 'preview'])->name('stage.preview');
        Route::get('stage/snapshot', [StageController::class, 'snapshot'])->middleware('throttle:stage-poll')->name('stage.snapshot');
        Route::get('stage/state', [StageController::class, 'state'])->middleware('throttle:stage-poll');
        Route::post('stage/command', [StageController::class, 'command'])->middleware('throttle:staff')->name('stage.command');
        Route::post('stage/tribute', [StageController::class, 'tribute'])->middleware('throttle:staff')->name('stage.tribute');
        Route::post('stage/pair', [StageController::class, 'pair'])->middleware('throttle:staff')->name('stage.pair');
        Route::post('stage/displays/{id}/revoke', [StageController::class, 'revoke'])->whereUuid('id')->middleware('throttle:staff')->name('stage.revoke');
    });
    Route::middleware(['admin.access', 'throttle:staff'])->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');
        Route::post('submissions/{id}', [AdminController::class, 'update'])->whereUuid('id')->name('decide');
    });
});
