<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiBoundary
{
    public function handle(Request $request, Closure $next): Response
    {
        // Bound actual bytes as well as Content-Length (which is client-controlled).
        abort_if(strlen($request->getContent()) > 8192, 413, 'Request is too large.');
        if ($request->isMethod('POST')) {
            abort_unless($request->isJson(), 415, 'Use application/json.');
            $body = json_decode($request->getContent());
            abort_if(json_last_error() !== JSON_ERROR_NONE || ! is_object($body), 400, 'Expected a JSON object.');
        }

        return $next($request);
    }
}
