<?php

namespace App\Services;

use App\Enums\SubmissionStatus;
use App\Models\AuditEvent;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ModerationService
{
    public function decide(User $actor, string $id, string $action, int $version, ?string $reason): Submission
    {
        return DB::transaction(function () use ($actor, $id, $action, $version, $reason) {
            // Recheck the current role inside the transaction, serializing with staff:disable.
            $current = User::whereKey($actor->id)->lockForUpdate()->firstOrFail();
            Gate::forUser($current)->authorize('moderate-submissions');
            $row = Submission::whereKey($id)->lockForUpdate()->firstOrFail();
            abort_if($row->status === SubmissionStatus::Withdrawn, 409, 'Người gửi đã rút lời nhắn. Không thể kiểm duyệt hoặc khôi phục nội dung này.');
            abort_if($row->moderation_version !== $version, 409, 'Lời nhắn đã được người khác xử lý. Hãy tải lại trước khi quyết định.');
            $target = match ($action) {
                'approve' => $row->status === SubmissionStatus::Pending ? SubmissionStatus::Approved : null,
                'reject' => $row->status === SubmissionStatus::Pending ? SubmissionStatus::Rejected : null,
                'hide' => $row->status === SubmissionStatus::Approved ? SubmissionStatus::Hidden : null,
                'reopen' => in_array($row->status, [SubmissionStatus::Rejected, SubmissionStatus::Hidden], true) ? SubmissionStatus::Pending : null,
                default => null,
            };
            abort_unless($target, 409, 'Thao tác không còn phù hợp với trạng thái hiện tại.');
            abort_if(in_array($action, ['reject', 'hide'], true) && ! array_key_exists($reason ?? '', config('admin.reasons')), 422, 'Vui lòng chọn lý do xử lý.');
            $from = $row->status->value;
            $row->update(['status' => $target, 'moderation_version' => $version + 1]);
            $audit = new AuditEvent;
            $audit->forceFill([
                'submission_id' => $row->id, 'actor_id' => $current->id,
                'action' => 'moderation.'.$action, 'from_status' => $from,
                'to_status' => $target->value, 'moderation_version' => $version + 1,
                'reason_code' => in_array($action, ['reject', 'hide'], true) ? $reason : null,
            ])->save();

            return $row;
        });
    }
}
