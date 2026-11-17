<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        config([
            'session.driver' => config('admin.session_driver'),
            'session.cookie' => 'uwl_admin_session',
            'session.path' => '/admin',
            'session.http_only' => true,
            'session.same_site' => 'strict',
            'session.secure' => config('admin.secure_cookie'),
            'session.lifetime' => 60,
            'session.encrypt' => true,
        ]);

        return $next($request);
    }
}
