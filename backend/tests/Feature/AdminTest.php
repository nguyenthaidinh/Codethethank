<?php

namespace Tests\Feature;

use App\Enums\StaffRole;
use App\Enums\SubmissionStatus;
use App\Models\AuditEvent;
use App\Models\Submission;
use App\Models\User;
use App\Services\ModerationService;
use App\Services\SubmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    private function staff(StaffRole $role = StaffRole::Moderator): User
    {
        return User::factory()->create(['role' => $role, 'active' => true, 'password' => 'TestPassword123!']);
    }

    private function login(User $user): void
    {
        $this->post('/admin/login', ['email' => $user->email, 'password' => 'TestPassword123!'])->assertRedirect('/admin');
    }

    private function letter(string $message = 'Cảm ơn cô đã kiên nhẫn với em.'): Submission
    {
        return app(SubmissionService::class)->submit([
            'recipient' => 'Cô Vân', 'message' => $message, 'display_name' => 'Minh',
            'consent' => ['accepted' => true, 'version' => 'public-wall-v1'],
        ], (string) Str::uuid(), bin2hex(random_bytes(32)))[0];
    }

    public function test_admin_is_session_only_and_anonymous_cannot_read_or_decide(): void
    {
        $letter = $this->letter();
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->post('/admin/submissions/'.$letter->id, ['action' => 'approve', 'version' => 0])->assertRedirect('/admin/login');
        $user = $this->staff();
        $token = $user->createToken('api', ['staff:identity'])->plainTextToken;
        $this->withToken($token)->get('/admin')->assertRedirect('/admin/login');
        $this->assertSame(SubmissionStatus::Pending, $letter->fresh()->status);
    }

    public function test_login_rotates_session_and_logout_removes_access(): void
    {
        $user = $this->staff();
        $this->get('/admin/login')->assertOk()->assertSee('Chào người');
        $before = session()->getId();
        $this->login($user);
        $this->assertNotSame($before, session()->getId());
        $this->get('/admin')->assertOk()->assertSee('Lời nhắn tri ân');
        $this->post('/admin/logout')->assertRedirect('/admin/login');
        Auth::forgetGuards();
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->assertDatabaseHas('audit_events', ['actor_id' => $user->id, 'action' => 'admin.logout']);
    }

    public function test_operator_disabled_and_expired_sessions_are_denied(): void
    {
        $operator = $this->staff(StaffRole::Operator);
        $this->post('/admin/login', ['email' => $operator->email, 'password' => 'TestPassword123!'])->assertRedirect('/admin/stage');
        $this->get('/admin')->assertForbidden();
        $this->post('/admin/logout');
        $user = $this->staff();
        $this->login($user);
        $user->forceFill(['active' => false])->save();
        Auth::forgetGuards();
        $this->get('/admin')->assertRedirect('/admin/login');
        $user->forceFill(['active' => true])->save();
        $this->login($user);
        $this->withSession(['admin_authenticated_at' => now()->subHours(9)->timestamp])->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_password_or_role_change_revokes_current_browser_access(): void
    {
        $user = $this->staff();
        $this->login($user);
        $user->forceFill(['role' => StaffRole::Operator])->save();
        Auth::forgetGuards();
        $this->get('/admin')->assertForbidden();
        $user->forceFill(['role' => StaffRole::Moderator, 'password' => 'ChangedPassword123!'])->save();
        Auth::forgetGuards();
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_full_letter_is_escaped_and_hashes_are_never_rendered(): void
    {
        $letter = $this->letter('<script>window.attacked=1</script> Cảm ơn cô.');
        $this->login($this->staff());
        $response = $this->get('/admin?selected='.$letter->id)->assertOk();
        $response->assertSee('&lt;script&gt;window.attacked=1&lt;/script&gt;', false)->assertDontSee('<script>window.attacked=1</script>', false);
        foreach (['receipt_hash', 'idempotency_hash', 'payload_hash'] as $field) {
            $response->assertDontSee($letter->$field, false);
        }
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $response->assertHeader('X-Frame-Options', 'DENY');
        $this->assertStringContainsString("frame-ancestors 'none'", $response->headers->get('Content-Security-Policy'));
    }

    public function test_filter_search_and_pagination_do_not_expose_other_records(): void
    {
        for ($i = 0; $i < 13; $i++) {
            $this->letter('Bức thư số '.$i);
        }
        $approved = $this->letter('Tìm đúng 100%_ký hiệu');
        $approved->update(['status' => SubmissionStatus::Approved]);
        $this->login($this->staff());
        $this->get('/admin')->assertOk()->assertSee('1 / 2')->assertDontSee('Tìm đúng 100%_ký hiệu');
        $this->get('/admin?page=2')->assertOk()->assertSee('2 / 2');
        $this->get('/admin?status=approved&q='.urlencode('100%_'))->assertOk()->assertSee('Tìm đúng 100%_ký hiệu');
        $this->get('/admin?status=all&q='.urlencode('No match'))->assertOk()->assertSee('Chưa tìm thấy lời nhắn');
        $this->get('/admin?status=approved&q='.urlencode('100%X'))->assertOk()->assertDontSee('Tìm đúng 100%_ký hiệu');
    }

    public function test_moderation_workflow_records_actor_status_and_categorical_reason_only(): void
    {
        $letter = $this->letter();
        $user = $this->staff();
        $this->login($user);
        $url = '/admin/submissions/'.$letter->id;
        $this->post($url, ['action' => 'approve', 'version' => 0])->assertRedirect();
        $this->assertSame(SubmissionStatus::Approved, $letter->fresh()->status);
        $this->post($url, ['action' => 'hide', 'version' => 1, 'reason' => 'personal_data'])->assertRedirect();
        $this->assertSame(SubmissionStatus::Hidden, $letter->fresh()->status);
        $this->post($url, ['action' => 'reopen', 'version' => 2])->assertRedirect();
        $this->post($url, ['action' => 'reject', 'version' => 3, 'reason' => 'off_topic'])->assertRedirect();
        $this->assertSame(SubmissionStatus::Rejected, $letter->fresh()->status);
        $this->assertSame(4, $letter->fresh()->moderation_version);
        $this->assertDatabaseHas('audit_events', ['submission_id' => $letter->id, 'actor_id' => $user->id, 'from_status' => 'approved', 'to_status' => 'hidden', 'reason_code' => 'personal_data']);
        $this->assertStringNotContainsString($letter->message, AuditEvent::all()->toJson());
        $this->get('/admin?status=rejected&selected='.$letter->id)->assertSee('Thông tin cá nhân nhạy cảm')->assertSee('Đã từ chối');
    }

    public function test_stale_moderator_cannot_overwrite_another_decision_even_after_reopen(): void
    {
        $letter = $this->letter();
        $user = $this->staff();
        $other = $this->staff();
        $this->login($user);
        $service = app(ModerationService::class);
        $service->decide($other, $letter->id, 'reject', 0, 'spam');
        $service->decide($other, $letter->id, 'reopen', 1, null);
        $this->post('/admin/submissions/'.$letter->id, ['action' => 'approve', 'version' => 0])->assertConflict()->assertSee('được người khác xử lý');
        $this->assertSame(SubmissionStatus::Pending, $letter->fresh()->status);
        $this->assertDatabaseCount('audit_events', 4); // created, login, reject, reopen
    }

    public function test_withdrawal_is_terminal_and_never_restores_private_text(): void
    {
        $letter = $this->letter('Sensitive original content');
        $this->login($this->staff());
        app(SubmissionService::class)->withdraw($letter);
        $this->post('/admin/submissions/'.$letter->id, ['action' => 'approve', 'version' => 0])->assertConflict();
        $this->get('/admin?status=withdrawn&selected='.$letter->id)->assertOk()->assertSee('Người gửi đã rút lời nhắn.')->assertDontSee('Sensitive original content')->assertDontSee('Duyệt lời nhắn');
        $this->assertNull($letter->fresh()->message);
    }

    public function test_invalid_transition_and_missing_reason_do_not_mutate(): void
    {
        $letter = $this->letter();
        $this->login($this->staff());
        $url = '/admin/submissions/'.$letter->id;
        $this->post($url, ['action' => 'hide', 'version' => 0, 'reason' => 'spam'])->assertConflict();
        $this->post($url, ['action' => 'reject', 'version' => 0])->assertUnprocessable();
        $this->post($url, ['action' => 'approve', 'version' => -1])->assertSessionHasErrors('version');
        $this->assertSame(SubmissionStatus::Pending, $letter->fresh()->status);
        $this->assertDatabaseCount('audit_events', 2);
    }

    public function test_session_cookie_cannot_authenticate_the_bearer_only_api(): void
    {
        $this->login($this->staff());
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->getJson('/api/v1/submissions')->assertMethodNotAllowed();
        $this->get('/live-wall')->assertOk();
    }

    public function test_browser_login_is_rate_limited_without_creating_a_session(): void
    {
        $user = $this->staff();
        for ($i = 0; $i < 5; $i++) {
            $this->post('/admin/login', ['email' => $user->email, 'password' => 'bad'])->assertSessionHasErrors('email');
        }
        $this->post('/admin/login', ['email' => $user->email, 'password' => 'TestPassword123!'])->assertTooManyRequests()->assertHeader('Retry-After');
        $this->assertGuest('web');
    }

    public function test_assets_have_explicit_types_under_nosniff_and_csp(): void
    {
        $this->get('/admin/assets/app.css')->assertOk()->assertHeader('Content-Type', 'text/css; charset=utf-8');
        $this->get('/admin/assets/app.js')->assertOk()->assertHeader('Content-Type', 'application/javascript; charset=utf-8');
        $this->get('/admin/assets/serif-normal.woff2')->assertOk()->assertHeader('Content-Type', 'font/woff2');
        $this->get('/admin/assets/not-a-font.woff2')->assertNotFound();
    }
}
