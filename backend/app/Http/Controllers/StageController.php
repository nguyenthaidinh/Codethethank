<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\WallDisplay;
use App\Models\WallState;
use App\Services\LiveWallService;
use App\Services\TributeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StageController extends Controller
{
    public function index(LiveWallService $wall)
    {
        $state = WallState::findOrFail(1);
        $rows = $wall->eligible()->orderByDesc('created_at')->paginate(12);
        $displays = WallDisplay::whereNull('revoked_at')->where('expires_at', '>', now())->orderBy('created_at')->get();

        return view('wall.stage', compact('state', 'rows', 'displays'));
    }

    public function preview()
    {
        return view('wall.screen', ['preview' => true]);
    }

    public function snapshot(LiveWallService $wall)
    {
        return response()->json($wall->snapshot());
    }

    public function state()
    {
        $state = WallState::findOrFail(1);

        return response()->json(['revision' => $state->revision, 'mode' => $state->mode, 'blank' => $state->blank, 'effects' => $state->effects, 'tribute' => $state->tribute ? ['count' => count($state->tribute['rows']), 'seconds' => $state->tribute['seconds'], 'started_at_ms' => $state->tribute['started_at_ms']] : null, 'server_now_ms' => now()->getTimestampMs(), 'displays' => WallDisplay::whereNull('revoked_at')->where('expires_at', '>', now())->get()->map(fn ($display) => ['id' => $display->id, 'name' => $display->name, 'online' => $display->last_seen_at?->greaterThan(now()->subSeconds(7)) ?? false, 'ack_revision' => $display->ack_revision])]);
    }

    public function command(Request $request, LiveWallService $wall)
    {
        $input = $request->validate(['action' => ['required', Rule::in(['blank', 'resume', 'auto', 'manual', 'next', 'select', 'effects', 'tribute-stop'])], 'revision' => ['nullable', 'integer', 'min:0'], 'id' => ['nullable', 'uuid']]);
        $wall->command(Auth::guard('web')->user(), $input['action'], isset($input['revision']) ? (int) $input['revision'] : null, $input['id'] ?? null);

        return redirect()->route('admin.stage')->with('notice', $input['action'] === 'blank' ? 'Đã phát lệnh che màn hình. Kiểm tra xác nhận của máy chiếu bên dưới.' : 'Đã cập nhật điều khiển sân khấu.');
    }

    public function tribute(Request $request, TributeService $tribute)
    {
        $data = $request->validate(['revision' => ['required', 'integer', 'min:0'], 'additional' => ['nullable', 'string', 'max:81000'], 'players' => ['nullable', 'string', 'max:81000'], 'seconds' => ['required', 'integer', 'between:4,12']]);
        $tribute->start(Auth::guard('web')->user(), (int) $data['revision'], $data['additional'] ?? '', $data['players'] ?? '', (int) $data['seconds']);

        return redirect()->route('admin.stage')->with('notice', 'Đã bắt đầu tri ân theo danh sách đã chốt. Bật âm thanh tại cửa sổ máy chiếu; preview luôn im lặng.');
    }

    public function pair(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:80']]);
        $token = bin2hex(random_bytes(32));
        $display = WallDisplay::create(['name' => $data['name'], 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHours(12)]);
        AuditEvent::create(['actor_id' => Auth::guard('web')->id(), 'action' => 'stage.paired']);

        return view('wall.pair', ['display' => $display, 'url' => url('/live-wall').'#token='.$token]);
    }

    public function revoke(string $id)
    {
        WallDisplay::findOrFail($id)->update(['revoked_at' => now()]);
        AuditEvent::create(['actor_id' => Auth::guard('web')->id(), 'action' => 'stage.revoked']);

        return redirect()->route('admin.stage')->with('notice', 'Đã thu hồi quyền của màn hình. Nội dung sẽ được che khi nhận phản hồi hoặc hết hạn kết nối.');
    }
}
