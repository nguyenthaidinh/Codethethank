<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminHeaders
{
    public static function protect(Response $response): Response
    {
        ApiHeaders::protect($response);
        $preview = request()->is('admin/stage/preview');
        $ancestors = $preview ? "'self'" : "'none'";
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors $ancestors; base-uri 'none'; form-action 'self'");
        $response->headers->set('X-Frame-Options', $preview ? 'SAMEORIGIN' : 'DENY');

        return $response;
    }

    public function handle(Request $request, Closure $next): Response
    {
        return self::protect($next($request));
    }
}
