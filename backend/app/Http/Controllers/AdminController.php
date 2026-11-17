<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\Submission;
use App\Services\ModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $input = $request->validate([
            'status' => ['sometimes', Rule::in(array_merge(['all'], array_keys(config('admin.labels'))))],
            'q' => ['nullable', 'string', 'max:120'], 'page' => ['sometimes', 'integer', 'min:1', 'max:100000'],
            'selected' => ['sometimes', 'uuid'],
        ]);
        $status = $input['status'] ?? 'pending';
        $query = trim($input['q'] ?? '');
        $rows = Submission::query()->select(['id', 'recipient', 'message', 'display_name', 'status', 'created_at']);
        if ($status !== 'all') {
            $rows->where('status', $status);
        }
        if ($query !== '') {
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($query)).'%';
            $rows->where(function ($builder) use ($pattern) {
                foreach (['recipient', 'display_name', 'message'] as $column) {
                    $builder->orWhereRaw("LOWER($column) LIKE ? ESCAPE '!'", [$pattern]);
                }
            });
        }
        $rows = $rows->orderBy('created_at', $status === 'pending' ? 'asc' : 'desc')->orderBy('id')->paginate(12)->withQueryString();
        $selectedId = $input['selected'] ?? $rows->first()?->id;
        $selected = $selectedId ? Submission::findOrFail($selectedId) : null;
        $history = $selected ? AuditEvent::query()->leftJoin('users', 'users.id', '=', 'audit_events.actor_id')
            ->where('submission_id', $selected->id)->orderByDesc('audit_events.id')->limit(20)
            ->get(['audit_events.action', 'audit_events.created_at', 'audit_events.from_status', 'audit_events.to_status', 'audit_events.reason_code', 'users.name as actor_name']) : collect();
        $counts = Submission::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return view('admin.index', compact('rows', 'selected', 'history', 'status', 'query', 'counts'));
    }

    public function update(Request $request, string $id, ModerationService $service)
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['approve', 'reject', 'hide', 'reopen'])],
            'version' => ['required', 'integer', 'min:0'],
            'reason' => ['nullable', Rule::in(array_keys(config('admin.reasons')))],
        ]);
        $row = $service->decide(Auth::guard('web')->user(), $id, $data['action'], (int) $data['version'], $data['reason'] ?? null);
        $messages = ['approve' => 'Đã duyệt lời nhắn. Nội dung chưa được trình chiếu.', 'reject' => 'Đã từ chối lời nhắn.', 'hide' => 'Đã ẩn lời nhắn khỏi nội dung được duyệt.', 'reopen' => 'Đã đưa lời nhắn về hàng chờ để xem xét lại.'];

        return redirect()->route('admin.index', ['status' => $row->status->value, 'selected' => $row->id])->with('notice', $messages[$data['action']]);
    }
}
