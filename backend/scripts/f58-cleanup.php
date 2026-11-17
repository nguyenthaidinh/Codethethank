<?php

use App\Models\Submission;
use App\Models\User;
use App\Models\WallDisplay;
use App\Services\ModerationService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('local') || config('database.connections.pgsql.database') !== 'gratitude_wall_review') {
    throw new RuntimeException('F5.8 cleanup only permits the isolated local review database.');
}
$actor = User::where('email', 'f57-review@school.test')->firstOrFail();
$rows = Submission::where('status', 'approved')->where(function ($query) {
    $query->where(function ($samples) {
        $samples->where('display_name', 'F5.8 · Minh An')->whereIn('message', array_map(
            fn ($mode) => $mode.' · Cảm ơn cô đã chọn ở lại. Một ánh sáng từ câu chuyện của em.',
            ['desktop', 'mobile', 'fallback'],
        ));
    })->orWhere(function ($retry) {
        $retry->where('recipient', 'Cô kiểm tra')->where('message', 'Lời chúc kiểm tra mất phản hồi, chỉ tạo một bản.');
    });
})->get();
foreach ($rows as $row) {
    app(ModerationService::class)->decide($actor, $row->id, 'hide', $row->moderation_version, 'other');
}
// Revoke only pairing links created by this QA harness, including any failed-run links.
$revoked = WallDisplay::where('name', 'F5.8 · Máy chiếu duyệt')->whereNull('revoked_at')->update(['revoked_at' => now()]);
echo json_encode(['synthetic_messages_hidden' => $rows->count(), 'qa_displays_revoked' => $revoked]);
