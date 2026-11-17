<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\Submission;
use App\Models\User;
use App\Models\WallState;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class LiveWallService
{
    public const PAGE_SECONDS = 12;

    public function eligible()
    {
        return Submission::query()->where('status', 'approved')->whereIn('consent_version', ['public-wall-v1', 'public-wall-live-v2'])->whereNotNull('message')->whereNotNull('recipient');
    }

    public function pages(string $message): array
    {
        // Projection normalizes whitespace only; the original public message stays intact.
        // This bounds vertical layout even for submissions containing many blank lines.
        $message = preg_replace('/\s+/u', ' ', trim($message));
        preg_match_all('/\X/u', $message, $matches);

        return array_map(fn ($page) => implode('', $page), array_chunk($matches[0], 170)) ?: [''];
    }

    private function project(Submission $row): array
    {
        return ['id' => $row->id, 'recipient' => $row->recipient, 'message' => $row->message, 'display_name' => $row->display_name, 'pages' => $this->pages($row->message)];
    }

    private function choose(WallState $state, ?string $id = null): void
    {
        $query = $this->eligible();
        $row = $id ? $query->whereKey($id)->first() : $query->orderByRaw('CASE WHEN wall_presented_at IS NULL THEN 0 ELSE 1 END')->orderBy('wall_presented_at')->orderBy('created_at')->orderBy('id')->first();
        if ($id) {
            abort_unless($row, 409, 'Lời chúc không còn đủ điều kiện trình chiếu.');
        }
        $state->current_id = $row?->id;
        $state->started_at = $row ? now() : null;
        $state->revision++;
        $state->save();
        if ($row) {
            $row->update(['wall_presented_at' => now()]);
        }
    }

    public function snapshot(): array
    {
        return DB::transaction(function () {
            $state = WallState::whereKey(1)->lockForUpdate()->firstOrFail();
            $current = $state->current_id ? $this->eligible()->whereKey($state->current_id)->first() : null;
            if (! $state->blank && ! $state->tribute) {
                $expired = $current && $state->started_at && $state->started_at->addSeconds(count($this->pages($current->message)) * self::PAGE_SECONDS)->isPast();
                if ($state->mode === 'auto' && (! $current || $expired)) {
                    // Snapshot ticks the authorized Auto clock; serialized across every display.
                    if ($current || $this->eligible()->exists()) {
                        $this->choose($state);
                    } elseif ($state->current_id) {
                        $this->choose($state);
                    }
                    $current = $state->current_id ? $this->eligible()->whereKey($state->current_id)->first() : null;
                } elseif (! $current && $state->current_id) {
                    $state->update(['current_id' => null, 'started_at' => null, 'revision' => $state->revision + 1]);
                }
            }
            $items = $state->blank ? collect() : ($state->mode === 'manual' && ! $state->tribute ? collect($current ? [$current] : []) : $this->eligible()->orderByDesc('created_at')->orderByDesc('id')->limit(30)->get());

            return [
                'revision' => $state->revision, 'mode' => $state->mode, 'blank' => $state->blank,
                'effects' => $state->effects, 'server_now_ms' => (int) now()->getTimestampMs(),
                'started_at_ms' => $state->started_at?->getTimestampMs(), 'page_seconds' => self::PAGE_SECONDS,
                'lease_ms' => 6500, 'current' => ! $state->blank && $current ? $this->project($current) : null,
                'items' => $items->map(fn ($row) => $this->project($row))->values()->all(),
                'tribute' => $state->blank ? null : $state->tribute,
            ];
        });
    }

    public function command(User $actor, string $action, ?int $revision, ?string $id = null): void
    {
        DB::transaction(function () use ($actor, $action, $revision, $id) {
            $user = User::whereKey($actor->id)->lockForUpdate()->firstOrFail();
            Gate::forUser($user)->authorize('control-stage');
            $state = WallState::whereKey(1)->lockForUpdate()->firstOrFail();
            // Emergency Blank never waits for an up-to-date form or confirmation.
            abort_if($action !== 'blank' && $revision !== $state->revision, 409, 'Trạng thái sân khấu đã thay đổi. Hãy cập nhật trước khi điều khiển.');
            abort_if($state->tribute && in_array($action, ['next', 'select', 'auto', 'manual']), 409, 'Hãy kết thúc tri ân trước khi điều khiển lời chúc.');
            switch ($action) {
                case 'blank':
                    $state->fill(['blank' => true, 'current_id' => null, 'started_at' => null, 'tribute' => null]);
                    break;
                case 'resume':
                    $state->blank = false;
                    break;
                case 'auto':
                case 'manual':
                    $state->mode = $action;
                    break;
                case 'next':
                    abort_if($state->blank, 409, 'Màn hình đang được che. Hãy mở lại màn hình trước.');
                    $this->choose($state);
                    break;
                case 'select':
                    abort_if($state->blank || ! $id, 409, 'Mở lại màn hình và chọn một lời chúc.');
                    $state->mode = 'manual';
                    $this->choose($state, $id);
                    break;
                case 'effects':
                    $state->effects = ! $state->effects;
                    break;
                case 'tribute-stop':
                    $state->tribute = null;
                    $state->started_at = now();
                    break;
                default:
                    abort(422);
            }
            $state->revision++;
            $state->save();
            AuditEvent::create(['actor_id' => $user->id, 'action' => 'stage.'.$action]);
        });
    }
}
