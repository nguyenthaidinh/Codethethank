<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\User;
use App\Models\WallState;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TributeService
{
    public function roster(string $additional, string $players): array
    {
        $rows = array_map(fn ($teacher) => [...$teacher, 'group' => 'Kính gửi thầy cô'], config('tribute.teachers'));
        foreach (['Những người đồng hành' => $additional, 'Cảm ơn bạn đã chơi' => $players] as $group => $text) {
            foreach (preg_split('/\R/u', $text) as $name) {
                $name = preg_replace('/\s+/u', ' ', trim($name));
                if ($name === '') {
                    continue;
                }
                if (mb_strlen($name) > 80 || count($rows) >= 1013) {
                    throw ValidationException::withMessages(['additional' => 'Mỗi tên tối đa 80 ký tự; tối đa 1.000 tên bổ sung và người chơi.']);
                }
                $rows[] = ['id' => 'guest-'.count($rows), 'name' => $name, 'group' => $group];
            }
        }

        return $rows;
    }

    public function start(User $actor, int $revision, string $additional, string $players, int $seconds): void
    {
        $rows = $this->roster($additional, $players);
        DB::transaction(function () use ($actor, $revision, $rows, $seconds) {
            $user = User::whereKey($actor->id)->lockForUpdate()->firstOrFail();
            Gate::forUser($user)->authorize('control-stage');
            $state = WallState::whereKey(1)->lockForUpdate()->firstOrFail();
            abort_if($state->revision !== $revision || $state->blank, 409, 'Hãy cập nhật trạng thái và mở màn hình trước khi bắt đầu tri ân.');
            $state->update(['tribute' => ['id' => (string) Str::uuid(), 'rows' => $rows, 'seconds' => max(4, min(12, $seconds)), 'started_at_ms' => now()->getTimestampMs()], 'revision' => $state->revision + 1]);
            AuditEvent::create(['actor_id' => $user->id, 'action' => 'stage.tribute-start']);
        });
    }
}
