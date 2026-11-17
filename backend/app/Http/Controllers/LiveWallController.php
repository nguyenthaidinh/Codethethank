<?php

namespace App\Http\Controllers;

use App\Services\LiveWallService;
use Illuminate\Http\Request;

class LiveWallController extends Controller
{
    public function show()
    {
        return view('wall.screen', ['preview' => false]);
    }

    public function snapshot(Request $request, LiveWallService $wall)
    {
        $input = $request->validate(['ack' => ['nullable', 'integer', 'min:0']]);
        $snapshot = $wall->snapshot();
        $display = $request->attributes->get('wall_display');
        $display->update(['last_seen_at' => now(), 'ack_revision' => min($input['ack'] ?? 0, $snapshot['revision'])]);

        return response()->json($snapshot);
    }
}
