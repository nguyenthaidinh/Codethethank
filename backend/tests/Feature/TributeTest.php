<?php

namespace Tests\Feature;

use App\Enums\StaffRole;
use App\Models\User;
use App\Models\WallState;
use App\Services\LiveWallService;
use App\Services\TributeService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class TributeTest extends TestCase
{
    use RefreshDatabase;

    public function test_roster_preserves_teacher_order_duplicates_and_group_order(): void
    {
        $rows = app(TributeService::class)->roster("Mai\nMai", "An\nBình");
        $this->assertCount(17, $rows);
        $this->assertSame(['Cô Như', 'Cô Giang', 'Cô Trang', 'Thầy Thảo', 'Thầy Thắng', 'Thầy Xuân Thắng', 'Thầy Thọ', 'Thầy Hải', 'Thầy Thuận', 'Thầy Cương', 'Cô Hương', 'Thầy Tuấn', 'Thầy Tuấn', 'Mai', 'Mai', 'An', 'Bình'], array_column($rows, 'name'));
        $this->assertCount(17, array_unique(array_column($rows, 'id')));
    }

    public function test_tribute_is_finite_snapshot_and_emergency_blank_cancels_it(): void
    {
        $actor = User::factory()->create(['role' => StaffRole::Admin, 'active' => true]);
        $wall = app(LiveWallService::class);
        $wall->command($actor, 'resume', WallState::findOrFail(1)->revision);
        app(TributeService::class)->start($actor, WallState::findOrFail(1)->revision, '', '', 8);
        $snapshot = $wall->snapshot();
        $this->assertCount(13, $snapshot['tribute']['rows']);
        $this->travel(10)->minutes();
        $this->assertSame($snapshot['tribute'], $wall->snapshot()['tribute']);
        $wall->command($actor, 'blank', 0);
        $this->assertNull($wall->snapshot()['tribute']);
        $this->assertNull(WallState::findOrFail(1)->tribute);
    }

    public function test_start_cannot_unblank_the_projector(): void
    {
        $actor = User::factory()->create(['role' => StaffRole::Admin, 'active' => true]);
        $this->expectException(HttpException::class);
        app(TributeService::class)->start($actor, WallState::findOrFail(1)->revision, '', '', 8);
    }

    public function test_moderator_cannot_start_tribute(): void
    {
        $actor = User::factory()->create(['role' => StaffRole::Moderator, 'active' => true]);
        $this->expectException(AuthorizationException::class);
        app(TributeService::class)->start($actor, 0, '', '', 8);
    }

    public function test_stale_start_does_not_replace_running_roster(): void
    {
        $actor = User::factory()->create(['role' => StaffRole::Admin, 'active' => true]);
        app(LiveWallService::class)->command($actor, 'resume', WallState::findOrFail(1)->revision);
        $this->expectException(HttpException::class);
        app(TributeService::class)->start($actor, 999999, '', '', 8);
    }
}
