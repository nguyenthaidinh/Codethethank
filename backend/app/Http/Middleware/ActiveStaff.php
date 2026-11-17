<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActiveStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->active && $request->user()->tokenCan('staff:identity'), 403, 'Access denied.');

        return $next($request);
    }
}
