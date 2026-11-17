<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\User;
use App\Rules\BcryptPasswordLength;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:254'], 'password' => ['required', 'string', new BcryptPasswordLength]]);
        $user = User::where('email', mb_strtolower($data['email']))->first();
        // A dummy hash keeps the password-work path for nonexistent accounts.
        $valid = Hash::check($data['password'], $user?->password ?? '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');
        abort_unless($user && $valid && $user->active, 401, 'Invalid credentials.');

        $expires = now()->addMinutes(config('gratitude.token_minutes'));
        $token = DB::transaction(function () use ($user, $expires) {
            // Serialize token issue with staff:disable, then recheck the current account.
            $current = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_unless($current->active && $current->password === $user->password, 401, 'Invalid credentials.');
            $token = $current->createToken('staff-api', ['staff:identity'], $expires);
            AuditEvent::create(['actor_id' => $current->id, 'action' => 'staff.login']);

            return $token;
        });

        return response()->json(['token_type' => 'Bearer', 'access_token' => $token->plainTextToken, 'expires_at' => $expires->toIso8601String()]);
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json(['data' => ['id' => $user->id, 'name' => $user->name, 'role' => $user->role->value]]);
    }

    public function destroy(Request $request): JsonResponse
    {
        DB::transaction(function () use ($request) {
            $request->user()->currentAccessToken()->delete();
            AuditEvent::create(['actor_id' => $request->user()->id, 'action' => 'staff.logout']);
        });

        return response()->json(['logged_out' => true]);
    }
}
