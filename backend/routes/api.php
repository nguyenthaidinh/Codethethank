<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameWallController;
use App\Http\Controllers\LiveWallController;
use App\Http\Controllers\SubmissionController;
use App\Http\Middleware\WallDisplayAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('wall/game-feed', GameWallController::class)->middleware('throttle:game-wall');
    Route::get('wall/snapshot', [LiveWallController::class, 'snapshot'])->middleware([WallDisplayAccess::class, 'throttle:wall-display']);
    Route::get('sharing-policy', fn () => response()->json(['data' => [
        'version' => config('gratitude.consent_version'),
        'text' => config('gratitude.consent_text'),
        'limits' => ['recipient' => 60, 'message' => 500, 'display_name' => 40],
    ]]))->middleware('throttle:policy');
    Route::post('submissions', [SubmissionController::class, 'store'])->middleware('throttle:submission');
    Route::get('submissions/{id}', [SubmissionController::class, 'show'])->whereUuid('id')->middleware('throttle:receipt');
    Route::delete('submissions/{id}', [SubmissionController::class, 'destroy'])->whereUuid('id')->middleware('throttle:receipt');

    Route::post('auth/token', [AuthController::class, 'store'])->middleware('throttle:login');
    Route::middleware(['auth:sanctum', 'staff.active', 'throttle:staff'])->group(function () {
        Route::get('auth/me', [AuthController::class, 'show']);
        Route::delete('auth/token', [AuthController::class, 'destroy']);
    });
});
