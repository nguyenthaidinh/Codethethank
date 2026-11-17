<?php

namespace App\Http\Middleware;

use App\Models\WallDisplay;
use Closure;
use Illuminate\Http\Request;

class WallDisplayAccess
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('X-Wall-Token', '');
        abort_unless(preg_match('/^[0-9a-f]{64}$/D', $token), 401);
        $display = WallDisplay::where('token_hash', hash('sha256', $token))->whereNull('revoked_at')->where('expires_at', '>', now())->first();
        abort_unless($display, 401);
        $request->attributes->set('wall_display', $display);

        return $next($request);
    }
}
