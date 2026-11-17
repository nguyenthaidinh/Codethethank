<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class WallHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = ApiHeaders::protect($next($request));
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'");
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        return $response;
    }
}
