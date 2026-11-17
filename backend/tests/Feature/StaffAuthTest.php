<?php

namespace Tests\Feature;

use App\Enums\StaffRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class StaffAuthTest extends TestCase
{
    use RefreshDatabase;

    private function staff(StaffRole $role = StaffRole::Moderator, bool $active = true): User
    {
        return User::factory()->create(['email' => 'staff@school.test', 'password' => 'TestPassword123!', 'role' => $role, 'active' => $active]);
    }

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_anonymous_and_disabled_accounts_cannot_authenticate(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->postJson('/api/v1/auth/token', ['email' => 'absent@school.test', 'password' => 'bad'])->assertUnauthorized();
        $this->staff(active: false);
        $this->postJson('/api/v1/auth/token', ['email' => 'staff@school.test', 'password' => 'TestPassword123!'])->assertUnauthorized();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_returns_expiring_hashed_token_and_logout_revokes_it(): void
    {
        $user = $this->staff();
        $response = $this->postJson('/api/v1/auth/token', ['email' => 'STAFF@school.test', 'password' => 'TestPassword123!'])->assertOk();
        $token = $response->json('access_token');
        $stored = PersonalAccessToken::sole();
        $this->assertNotSame($token, $stored->token);
        $this->assertNotNull($stored->expires_at);
        $this->assertSame(['staff:identity'], $stored->abilities);
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.role', 'moderator')->assertJsonMissingPath('data.password');
        $this->withToken($token)->deleteJson('/api/v1/auth/token')->assertOk();
        Auth::forgetGuards();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseHas('audit_events', ['actor_id' => $user->id, 'action' => 'staff.logout']);
    }

    public function test_expired_wrong_ability_and_deactivated_tokens_are_denied(): void
    {
        $user = $this->staff();
        $expired = $user->createToken('expired', ['staff:identity'], now()->subMinute())->plainTextToken;
        $this->withToken($expired)->getJson('/api/v1/auth/me')->assertUnauthorized();
        Auth::forgetGuards();
        $wrong = $user->createToken('wrong', ['other'], now()->addHour())->plainTextToken;
        $this->withToken($wrong)->getJson('/api/v1/auth/me')->assertForbidden();
        Auth::forgetGuards();
        $token = $user->createToken('valid', ['staff:identity'], now()->addHour())->plainTextToken;
        $user->forceFill(['active' => false])->save();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertForbidden();
    }

    public function test_capabilities_are_separate_and_all_fail_for_inactive_staff(): void
    {
        $user = $this->staff();
        foreach ([StaffRole::Admin, StaffRole::Moderator, StaffRole::Operator] as $role) {
            $user->role = $role;
            $this->assertSame($role !== StaffRole::Operator, Gate::forUser($user)->allows('moderate-submissions'));
            $this->assertSame($role !== StaffRole::Moderator, Gate::forUser($user)->allows('control-stage'));
            $this->assertSame($role === StaffRole::Admin, Gate::forUser($user)->allows('manage-staff'));
        }
        $user->active = false;
        foreach (['moderate-submissions', 'control-stage', 'manage-staff'] as $ability) {
            $this->assertFalse(Gate::forUser($user)->allows($ability));
        }
    }

    public function test_login_is_rate_limited_and_no_public_registration_exists(): void
    {
        $this->staff();
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/token', ['email' => 'staff@school.test', 'password' => 'wrong'])->assertUnauthorized();
        }
        $this->postJson('/api/v1/auth/token', ['email' => 'staff@school.test', 'password' => 'TestPassword123!'])->assertTooManyRequests()->assertHeader('Retry-After');
        $this->postJson('/api/v1/register', [])->assertNotFound();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_disable_command_revokes_all_tokens(): void
    {
        $user = $this->staff();
        $user->createToken('one', ['staff:identity']);
        $user->createToken('two', ['staff:identity']);
        $this->artisan('staff:disable', ['email' => $user->email])->assertSuccessful();
        $this->assertFalse($user->fresh()->active);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_password_byte_limit_prevents_bcrypt_truncation_and_weak_provisioning(): void
    {
        $this->postJson('/api/v1/auth/token', ['email' => 'staff@school.test', 'password' => str_repeat('á', 37)])->assertUnprocessable();
        $this->artisan('staff:create', ['email' => 'weak@school.test', '--name' => 'Weak', '--role' => 'moderator'])
            ->expectsQuestion('Password (at least 12 characters, mixed case and numbers)', 'short')->assertFailed();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_provisioning_requires_strong_confirmed_password_and_seeding_creates_nobody(): void
    {
        $this->seed();
        $this->assertDatabaseCount('users', 0);
        $this->artisan('staff:create', ['email' => 'new@school.test', '--name' => 'Operator', '--role' => 'operator'])
            ->expectsQuestion('Password (at least 12 characters, mixed case and numbers)', 'StrongPassword123!')
            ->expectsQuestion('Confirm password', 'StrongPassword123!')->assertSuccessful();
        $this->assertTrue(User::sole()->active);
        $this->assertSame(StaffRole::Operator, User::sole()->role);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->artisan('staff:create', ['email' => 'bad@school.test', '--name' => 'Bad', '--role' => 'root'])->assertFailed();
    }
}
