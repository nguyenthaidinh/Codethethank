<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Rules\BcryptPasswordLength;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthController extends Controller
{
    public function create()
    {
        return view('admin.login');
    }

    public function store(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:254'], 'password' => ['required', 'string', new BcryptPasswordLength]]);
        $ok = Auth::guard('web')->attempt([
            'email' => mb_strtolower(trim($data['email'])), 'password' => $data['password'],
            'active' => true, 'role' => ['admin', 'moderator', 'operator'],
        ]);
        if (! $ok) {
            return back()->withErrors(['email' => 'Không thể đăng nhập. Kiểm tra thông tin và quyền kiểm duyệt.'])->onlyInput('email');
        }
        $request->session()->regenerate();
        $request->session()->put('admin_authenticated_at', now()->timestamp);
        $request->session()->put('admin_password_stamp', hash('sha256', Auth::guard('web')->user()->password));
        AuditEvent::create(['actor_id' => Auth::guard('web')->id(), 'action' => 'admin.login']);

        return redirect()->route(Auth::guard('web')->user()->role->value === 'operator' ? 'admin.stage' : 'admin.index');
    }

    public function destroy(Request $request)
    {
        if ($id = Auth::guard('web')->id()) {
            AuditEvent::create(['actor_id' => $id, 'action' => 'admin.logout']);
        }
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
