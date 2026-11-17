<?php

namespace App\Providers;

use App\Enums\StaffRole;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // No external services or game runtime dependencies.
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $ipKey = fn (Request $request) => hash_hmac('sha256', (string) $request->ip(), config('app.key'));
        RateLimiter::for('submission', fn (Request $request) => [
            Limit::perMinute(config('gratitude.submit_per_minute'))->by('submit-minute:'.$ipKey($request)),
            Limit::perHour(config('gratitude.submit_per_hour'))->by('submit-hour:'.$ipKey($request)),
            Limit::perMinute(5)->by('submit-receipt:'.hash('sha256', $request->header('X-Receipt-Token', ''))),
        ]);
        RateLimiter::for('receipt', fn (Request $request) => Limit::perMinute(config('gratitude.receipt_per_minute'))->by($ipKey($request)));
        RateLimiter::for('policy', fn (Request $request) => Limit::perMinute(120)->by($ipKey($request)));
        // School Wi-Fi shares one public IP; each open ending polls every 1.5 seconds.
        RateLimiter::for('game-wall', fn (Request $request) => Limit::perMinute(6000)->by('game-wall:'.$ipKey($request)));
        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(20)->by('login-ip:'.$ipKey($request)),
            Limit::perMinute(5)->by('login-account:'.hash_hmac('sha256', mb_strtolower(is_string($request->input('email')) ? $request->input('email') : ''), config('app.key'))),
        ]);
        RateLimiter::for('staff', fn (Request $request) => Limit::perMinute(120)->by((string) $request->user()?->id));
        RateLimiter::for('wall-display', fn (Request $request) => [
            Limit::perMinute(120)->by('wall:'.hash('sha256', $request->header('X-Wall-Token', ''))),
            Limit::perMinute(600)->by('wall-ip:'.$ipKey($request)),
        ]);
        RateLimiter::for('stage-poll', fn (Request $request) => Limit::perMinute(240)->by('stage:'.(string) $request->user()?->id));

        // Capability foundation only; moderation and stage endpoints belong to F5.6/F5.7.
        Gate::define('moderate-submissions', fn (User $user) => $user->active && in_array($user->role, [StaffRole::Admin, StaffRole::Moderator], true));
        Gate::define('control-stage', fn (User $user) => $user->active && in_array($user->role, [StaffRole::Admin, StaffRole::Operator], true));
        Gate::define('manage-staff', fn (User $user) => $user->active && $user->role === StaffRole::Admin);
    }
}
