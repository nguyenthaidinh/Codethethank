<?php

namespace Tests\Feature;

use App\Models\WallState;
use App\Services\SubmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GameWallTest extends TestCase
{
    use RefreshDatabase;

    public function test_feed_is_public_bounded_read_only_and_contains_only_publishable_fields(): void
    {
        $state = WallState::findOrFail(1);
        $state->update(['blank' => false]);
        $before = $state->fresh()->toArray();
        for ($i = 0; $i < 9; $i++) {
            app(SubmissionService::class)->submit(['recipient' => 'Cô Vân', 'message' => 'Cảm ơn '.$i, 'display_name' => 'An', 'consent' => ['accepted' => true, 'version' => 'public-wall-live-v2']], (string) Str::uuid(), bin2hex(random_bytes(32)));
        }
        $response = $this->getJson('/api/v1/wall/game-feed')->assertOk()->assertJsonCount(6, 'items');
        $this->assertEqualsCanonicalizing(['id', 'recipient', 'message', 'display_name'], array_keys($response->json('items.0')));
        $this->assertSame($before, $state->fresh()->toArray());
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->getJson('/api/v1/wall/snapshot')->assertUnauthorized();
    }

    public function test_pending_hidden_withdrawn_and_emergency_blank_are_not_exposed(): void
    {
        WallState::findOrFail(1)->update(['blank' => false]);
        $make = fn ($version) => app(SubmissionService::class)->submit(['recipient' => 'Cô', 'message' => 'Lời chúc thật', 'consent' => ['accepted' => true, 'version' => $version]], (string) Str::uuid(), bin2hex(random_bytes(32)))[0];
        $make('public-wall-v1');
        $row = $make('public-wall-live-v2');
        $this->getJson('/api/v1/wall/game-feed')->assertJsonCount(1, 'items');
        $row->update(['status' => 'hidden']);
        $this->getJson('/api/v1/wall/game-feed')->assertJsonCount(0, 'items');
        $row->update(['status' => 'withdrawn']);
        $this->getJson('/api/v1/wall/game-feed')->assertJsonCount(0, 'items');
        $make('public-wall-live-v2');
        WallState::findOrFail(1)->update(['blank' => true]);
        $this->getJson('/api/v1/wall/game-feed')->assertJsonPath('blank', true)->assertJsonCount(0, 'items');
    }
}
