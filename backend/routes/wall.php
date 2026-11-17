<?php

use App\Http\Controllers\LiveWallController;
use App\Http\Middleware\WallHeaders;
use Illuminate\Support\Facades\Route;

Route::middleware(WallHeaders::class)->group(function () {
    Route::get('/live-wall', [LiveWallController::class, 'show'])->name('wall.screen');
    Route::get('/gratitude', fn () => view('wall.share'))->name('wall.share');
    Route::get('/wall-assets/{asset}', function (string $asset) {
        $types = ['wall.css' => 'text/css', 'wall.js' => 'application/javascript', 'tribute.js' => 'application/javascript', 'tribute.css' => 'text/css', 'thank-you.m4a' => 'audio/mp4', 'lantern-art.js' => 'application/javascript', 'stage.js' => 'application/javascript', 'share.js' => 'application/javascript'];
        abort_unless(isset($types[$asset]), 404);

        return response()->file(public_path('wall/'.$asset), ['Content-Type' => $types[$asset].'; charset=utf-8']);
    });
});
