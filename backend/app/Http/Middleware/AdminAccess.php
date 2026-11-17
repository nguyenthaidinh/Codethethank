<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class AdminAccess
{
    public function handle(Request $request, Closure $next, string $ability = 'moderate-submissions'): Response
    {
        $user = Auth::guard('web')->user();
        $started = $request->session()->get('admin_authenticated_at', 0);
        if (! $user || ! $user->active || $started < now()->subHours(8)->timestamp || ! hash_equals(hash('sha256', $user->password), $request->session()->get('admin_password_stamp', ''))) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->with('notice', 'Vui lòng đăng nhập để tiếp tục.');
        }
        abort_unless(in_array($ability, ['moderate-submissions', 'control-stage'], true) && Gate::forUser($user)->allows($ability), 403, 'Tài khoản không có quyền thực hiện chức năng này.');

        return $next($request);
    }
}
