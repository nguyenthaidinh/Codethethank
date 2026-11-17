<?php

namespace App\Http\Controllers;

use App\Models\WallState;
use App\Services\LiveWallService;

class GameWallController extends Controller
{
    public function __invoke(LiveWallService $wall)
    {
        // Read-only public projection. Never tick the stage clock or expose receipts.
        $blank = WallState::findOrFail(1)->blank;
        $items = $blank ? collect() : $wall->eligible()
            ->orderByDesc('created_at')->orderByDesc('id')->limit(6)
            ->get(['id', 'recipient', 'message', 'display_name']);

        return response()->json(['blank' => $blank, 'items' => $items->map(fn ($row) => [
            'id' => $row->id, 'recipient' => $row->recipient,
            'message' => $row->message, 'display_name' => $row->display_name,
        ])->values()])->header('Cache-Control', 'no-store, private');
    }
}
