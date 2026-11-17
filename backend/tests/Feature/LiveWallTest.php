<?php

namespace Tests\Feature;

use App\Enums\StaffRole;
use App\Models\Submission;
use App\Models\User;
use App\Models\WallDisplay;
use App\Models\WallState;
use App\Services\LiveWallService;
use App\Services\ModerationService;
use App\Services\SubmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class LiveWallTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    private function letter(string $version = 'public-wall-live-v2', string $message = 'Cảm ơn cô vì đã ở lại.'): Submission
    {
        return app(SubmissionService::class)->submit(['recipient' => 'Cô Vân', 'message' => $message, 'display_name' => 'An', 'consent' => ['accepted' => true, 'version' => $version]], (string) Str::uuid(), bin2hex(random_bytes(32)))[0];
    }

    private function actor(StaffRole $role = StaffRole::Admin): User
    {
        return User::factory()->create(['role' => $role, 'active' => true, 'password' => 'TestPassword123!']);
    }

    private function command(string $action, ?string $id = null): void
    {
        app(LiveWallService::class)->command($this->actor(), $action, WallState::findOrFail(1)->revision, $id);
    }

    public function test_new_explicit_consent_publishes_immediately_legacy_stays_pending(): void
    {
        $headers = ['Idempotency-Key' => (string) Str::uuid(), 'X-Receipt-Token' => bin2hex(random_bytes(32))];
        $this->postJson('/api/v1/submissions', ['recipient' => 'Cô', 'message' => 'Cảm ơn!', 'consent' => ['accepted' => true, 'version' => 'public-wall-live-v2']], $headers)->assertCreated()->assertJsonPath('data.status', 'approved');
        $this->assertDatabaseHas('submissions', ['publication_mode' => 'instant']);
        $this->assertDatabaseHas('audit_events', ['action' => 'submission.published']);
        $legacy = $this->letter('public-wall-v1');
        $this->command('resume');
        $snapshot = app(LiveWallService::class)->snapshot();
        $this->assertCount(1, $snapshot['items']);
        $this->assertNotSame($legacy->id, $snapshot['current']['id']);
    }

    public function test_paired_read_token_is_required_revocable_expiring_and_minimal(): void
    {
        $this->letter();
        $this->command('resume');
        $this->getJson('/api/v1/wall/snapshot')->assertUnauthorized();
        $token = bin2hex(random_bytes(32));
        $display = WallDisplay::create(['name' => 'Test', 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHour()]);
        $headers = ['X-Wall-Token' => $token];
        $response = $this->getJson('/api/v1/wall/snapshot?ack=1', $headers)->assertOk()->assertJsonCount(1, 'items');
        foreach (['receipt_hash', 'idempotency_hash', 'consented_at', 'token_hash'] as $field) {
            $this->assertStringNotContainsString($field, $response->getContent());
        }
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->assertNotNull($display->fresh()->last_seen_at);
        $this->get('/admin/stage', $headers)->assertRedirect('/admin/login');
        $display->update(['revoked_at' => now()]);
        $this->getJson('/api/v1/wall/snapshot', $headers)->assertUnauthorized();
        $display->update(['revoked_at' => null, 'expires_at' => now()->subSecond()]);
        $this->getJson('/api/v1/wall/snapshot', $headers)->assertUnauthorized();
    }

    public function test_blank_is_default_and_overrides_stale_commands(): void
    {
        $this->letter();
        $wall = app(LiveWallService::class);
        $this->assertSame([], $wall->snapshot()['items']);
        $this->command('resume');
        $oldRevision = WallState::find(1)->revision;
        $wall->command($this->actor(), 'blank', 0);
        $this->assertTrue($wall->snapshot()['blank']);
        $this->assertNull($wall->snapshot()['current']);
        $this->expectException(HttpException::class);
        $wall->command($this->actor(), 'resume', $oldRevision);
    }

    public function test_auto_pages_full_unicode_and_advances_fairly(): void
    {
        $this->freezeTime();
        $first = $this->letter(message: str_repeat('á', 350));
        $second = $this->letter(message: 'Lời thứ hai');
        $first->update(['created_at' => now()->subMinute()]);
        $this->command('resume');
        $wall = app(LiveWallService::class);
        $snapshot = $wall->snapshot();
        $this->assertSame($first->id, $snapshot['current']['id']);
        $this->assertCount(3, $snapshot['current']['pages']);
        $this->assertSame($first->message, implode('', $snapshot['current']['pages']));
        $this->travel(35)->seconds();
        $this->assertSame($first->id, $wall->snapshot()['current']['id']);
        $this->travel(2)->seconds();
        $this->assertSame($second->id, $wall->snapshot()['current']['id']);
        $this->travel(13)->seconds();
        $this->assertSame($first->id, $wall->snapshot()['current']['id']);
    }

    public function test_manual_holds_only_selected_message_and_hide_or_withdraw_removes_it(): void
    {
        $first = $this->letter();
        $this->command('resume');
        $this->command('select', $first->id);
        $this->letter(message: 'New live message');
        $this->travel(5)->minutes();
        $wall = app(LiveWallService::class);
        $snapshot = $wall->snapshot();
        $this->assertSame('manual', $snapshot['mode']);
        $this->assertSame($first->id, $snapshot['current']['id']);
        $this->assertCount(1, $snapshot['items']);
        app(ModerationService::class)->decide($this->actor(), $first->id, 'hide', 0, 'other');
        $this->assertNull($wall->snapshot()['current']);
        $this->assertSame([], $wall->snapshot()['items']);
        $second = $this->letter();
        $this->command('select', $second->id);
        app(SubmissionService::class)->withdraw($second);
        $this->assertNull($wall->snapshot()['current']);
        $this->assertSame([], $wall->snapshot()['items']);
    }

    public function test_operator_stage_role_and_moderator_separation(): void
    {
        $operator = $this->actor(StaffRole::Operator);
        $this->post('/admin/login', ['email' => $operator->email, 'password' => 'TestPassword123!'])->assertRedirect('/admin/stage');
        $this->get('/admin/stage')->assertOk()->assertSee('Emergency Blank');
        $this->get('/admin/stage/preview')->assertOk()->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $this->get('/admin')->assertForbidden();
        $this->post('/admin/stage/pair', ['name' => 'Projector'])->assertOk()->assertSee('#token=', false);
        $this->assertDatabaseCount('wall_displays', 1);
        $this->post('/admin/logout');
        $moderator = $this->actor(StaffRole::Moderator);
        $this->post('/admin/login', ['email' => $moderator->email, 'password' => 'TestPassword123!']);
        $this->get('/admin/stage')->assertForbidden();
        $this->post('/admin/stage/command', ['action' => 'blank'])->assertForbidden();
    }

    public function test_projection_bounds_newlines_without_changing_stored_letter(): void
    {
        $message = 'Cảm ơn'.str_repeat("\n", 160).'cô 💛';
        $row = $this->letter(message: $message);
        $this->assertSame(['Cảm ơn cô 💛'], app(LiveWallService::class)->pages($message));
        $this->assertSame($message, $row->fresh()->message);
    }

    public function test_hidden_message_cannot_be_selected_or_leak_after_auto_tick(): void
    {
        $row = $this->letter();
        $this->command('resume');
        $wall = app(LiveWallService::class);
        $this->assertSame($row->id, $wall->snapshot()['current']['id']);
        app(ModerationService::class)->decide($this->actor(), $row->id, 'hide', 0, 'other');
        $this->assertNull($wall->snapshot()['current']);
        $this->assertSame([], $wall->snapshot()['items']);
        $this->expectException(HttpException::class);
        $this->command('select', $row->id);
    }
}
