<?php

namespace Tests\Feature;

use App\Enums\SubmissionStatus;
use App\Models\AuditEvent;
use App\Models\Submission;
use App\Services\SubmissionService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;

class SubmissionTest extends TestCase
{
    use RefreshDatabase;

    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->headers = ['Idempotency-Key' => (string) Str::uuid(), 'X-Receipt-Token' => bin2hex(random_bytes(32))];
    }

    private function payload(array $override = []): array
    {
        return array_replace(['recipient' => 'Cô Vân', 'message' => 'Cảm ơn cô đã ở lại. 💛', 'display_name' => 'Minh', 'consent' => ['accepted' => true, 'version' => 'public-wall-v1']], $override);
    }

    public function test_explicit_consent_creates_pending_only_and_returns_no_letter_or_secrets(): void
    {
        $response = $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertCreated()->assertJsonPath('data.status', 'pending');
        $record = Submission::sole();
        $this->assertSame('Cô Vân', $record->recipient);
        $this->assertSame($response->json('data.id'), $record->id);
        $this->assertSame(hash('sha256', $this->headers['X-Receipt-Token']), $record->receipt_hash);
        $this->assertNotSame($this->headers['Idempotency-Key'], $record->idempotency_hash);
        $this->assertNotNull($record->consented_at);
        $this->assertDatabaseCount('audit_events', 1);
        foreach (['Cô Vân', 'Cảm ơn', 'Minh', $this->headers['X-Receipt-Token']] as $secret) {
            $this->assertStringNotContainsString($secret, $response->getContent());
            $this->assertStringNotContainsString($secret, $record->toJson());
            $this->assertStringNotContainsString($secret, AuditEvent::all()->toJson());
        }
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_private_preference_and_false_string_or_outdated_consent_never_persist(): void
    {
        foreach ([null, ['accepted' => false, 'version' => 'public-wall-v1'], ['accepted' => 'true', 'version' => 'public-wall-v1'], ['accepted' => 1, 'version' => 'public-wall-v1'], ['accepted' => true, 'version' => 'old']] as $consent) {
            $this->postJson('/api/v1/submissions', $this->payload(['consent' => $consent]), $this->headers)->assertUnprocessable();
        }
        Cache::flush();
        $this->postJson('/api/v1/submissions', ['audience' => 'public', 'message' => 'Only a preference'], $this->headers)->assertUnprocessable();
        $this->assertDatabaseCount('submissions', 0);
    }

    public function test_unknown_fields_and_client_selected_moderation_status_are_rejected(): void
    {
        foreach (['local' => true, 'save' => ['completed' => true], 'status' => 'approved', 'audience' => 'private'] as $key => $value) {
            $this->postJson('/api/v1/submissions', $this->payload([$key => $value]), $this->headers)->assertUnprocessable();
        }
        $this->postJson('/api/v1/submissions', $this->payload(['consent' => ['accepted' => true, 'version' => 'public-wall-v1', 'hidden' => true]]), $this->headers)->assertUnprocessable();
        $this->assertDatabaseCount('submissions', 0);
    }

    public function test_unicode_limits_use_normalized_code_points_and_preserve_plain_text(): void
    {
        $message = str_repeat("a\u{0301}", 500);
        $this->postJson('/api/v1/submissions', $this->payload(['message' => $message]), $this->headers)->assertCreated();
        $this->assertSame(str_repeat('á', 500), Submission::sole()->message);
        $headers = ['Idempotency-Key' => (string) Str::uuid(), 'X-Receipt-Token' => bin2hex(random_bytes(32))];
        $this->postJson('/api/v1/submissions', $this->payload(['message' => str_repeat('💛', 501)]), $headers)->assertUnprocessable();
        $this->postJson('/api/v1/submissions', $this->payload(['recipient' => str_repeat('á', 61)]), $headers)->assertUnprocessable();
        $this->postJson('/api/v1/submissions', $this->payload(['display_name' => str_repeat('á', 41)]), $headers)->assertUnprocessable();
        $this->postJson('/api/v1/submissions', $this->payload(['message' => '<script>alert(1)</script>']), $headers)->assertCreated();
        $this->assertDatabaseHas('submissions', ['message' => '<script>alert(1)</script>', 'status' => 'pending']);
    }

    public function test_invalid_headers_control_characters_and_empty_messages_are_rejected(): void
    {
        $this->postJson('/api/v1/submissions', $this->payload())->assertUnprocessable();
        $this->postJson('/api/v1/submissions', $this->payload(), ['Idempotency-Key' => 'bad', 'X-Receipt-Token' => 'guessable'])->assertUnprocessable();
        foreach (['  ', "hello\0world", "hello\u{202E}world"] as $message) {
            $this->postJson('/api/v1/submissions', $this->payload(['message' => $message]), $this->headers)->assertUnprocessable();
        }
        $this->assertDatabaseCount('submissions', 0);
    }

    public function test_idempotency_retries_do_not_duplicate_and_conflicts_do_not_overwrite(): void
    {
        $first = $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertCreated();
        $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertOk()->assertJsonPath('data.id', $first->json('data.id'));
        $this->postJson('/api/v1/submissions', $this->payload(['message' => 'Changed']), $this->headers)->assertConflict();
        $this->postJson('/api/v1/submissions', $this->payload(), array_replace($this->headers, ['X-Receipt-Token' => bin2hex(random_bytes(32))]))->assertConflict();
        $this->postJson('/api/v1/submissions', $this->payload(), array_replace($this->headers, ['Idempotency-Key' => (string) Str::uuid()]))->assertConflict();
        $this->assertDatabaseCount('submissions', 1);
        $this->assertDatabaseCount('audit_events', 1);
        $this->assertSame($this->payload()['message'], Submission::sole()->message);
    }

    public function test_only_the_receipt_holder_can_read_status_or_withdraw(): void
    {
        $id = $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->json('data.id');
        $url = '/api/v1/submissions/'.$id;
        $this->getJson($url)->assertNotFound();
        $this->getJson($url, ['X-Receipt-Token' => bin2hex(random_bytes(32))])->assertNotFound();
        $this->deleteJson($url)->assertNotFound();
        $this->getJson($url, $this->headers)->assertOk()->assertJsonPath('data.status', 'pending')->assertJsonMissingPath('data.message');
        $this->getJson('/api/v1/submissions')->assertMethodNotAllowed();
    }

    public function test_withdrawal_scrubs_content_and_retry_cannot_recreate_it(): void
    {
        $id = $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->json('data.id');
        // Withdrawal must also work after future moderation, not only while pending.
        Submission::whereKey($id)->update(['status' => SubmissionStatus::Approved]);
        $this->deleteJson('/api/v1/submissions/'.$id, [], $this->headers)->assertOk()->assertJsonPath('data.status', 'withdrawn');
        $this->deleteJson('/api/v1/submissions/'.$id, [], $this->headers)->assertOk();
        $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertOk()->assertJsonPath('data.status', 'withdrawn');
        $record = Submission::sole();
        $this->assertNull($record->message);
        $this->assertNull($record->recipient);
        $this->assertNull($record->display_name);
        $this->assertNotNull($record->withdrawn_at);
        $this->assertDatabaseCount('audit_events', 2);
    }

    public function test_rate_limit_returns_retry_after_without_writing_another_letter(): void
    {
        config(['gratitude.submit_per_minute' => 2]);
        $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertCreated();
        $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertOk();
        $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertTooManyRequests()->assertHeader('Retry-After');
        $this->assertDatabaseCount('submissions', 1);
    }

    public function test_json_body_boundary_and_no_cache_on_error(): void
    {
        $this->post('/api/v1/submissions', $this->payload(), ['Accept' => 'application/json'])->assertStatus(415);
        $this->call('POST', '/api/v1/submissions', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{')->assertBadRequest();
        $this->call('POST', '/api/v1/submissions', [], [], [], ['CONTENT_TYPE' => 'application/json'], '[]')->assertBadRequest();
        $this->postJson('/api/v1/submissions', $this->payload(['message' => str_repeat('a', 9000)]), $this->headers)->assertStatus(413);
        $response = $this->getJson('/api/v1/submissions/'.Str::uuid())->assertNotFound();
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->assertDatabaseCount('submissions', 0);
    }

    public function test_policy_and_cors_are_explicit_and_do_not_publish_content(): void
    {
        config(['cors.allowed_origins' => ['https://game.school.test']]);
        $this->getJson('/api/v1/sharing-policy', ['Origin' => 'https://game.school.test'])->assertOk()->assertHeader('Access-Control-Allow-Origin', 'https://game.school.test')->assertJsonPath('data.version', 'public-wall-live-v2');
        // A single allowed origin is emitted as a fixed header. Other origins cannot read it.
        $this->getJson('/api/v1/sharing-policy', ['Origin' => 'https://other.test'])->assertHeader('Access-Control-Allow-Origin', 'https://game.school.test');
        config(['cors.allowed_origins' => ['https://game.school.test', 'https://second.school.test']]);
        $this->getJson('/api/v1/sharing-policy', ['Origin' => 'https://other.test'])->assertHeaderMissing('Access-Control-Allow-Origin');
        $this->assertDatabaseCount('submissions', 0);
    }

    public function test_database_failure_does_not_leak_sql_bindings_even_with_debug_enabled(): void
    {
        config(['app.debug' => true]);
        Log::spy();
        $this->mock(SubmissionService::class)->shouldReceive('submit')->once()->andThrow(
            new QueryException('pgsql', 'insert into submissions values (?)', ['Sensitive letter body'], new \PDOException('Storage failure'))
        );
        $response = $this->postJson('/api/v1/submissions', $this->payload(), $this->headers)->assertStatus(503);
        $this->assertStringNotContainsString('Sensitive letter body', $response->getContent());
        $this->assertStringNotContainsString('insert into', $response->getContent());
        Log::shouldHaveReceived('error')->once()->with('Database operation failed.', ['sqlstate' => 'unknown']);
        $this->assertDatabaseCount('submissions', 0);
    }
}
