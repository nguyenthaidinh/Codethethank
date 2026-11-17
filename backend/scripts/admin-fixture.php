<?php

use App\Enums\StaffRole;
use App\Models\AuditEvent;
use App\Models\Submission;
use App\Models\User;
use App\Services\ModerationService;
use App\Services\SubmissionService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('local') || config('database.connections.pgsql.database') !== 'gratitude_admin_review') {
    throw new RuntimeException('Review fixtures require the isolated gratitude_admin_review local database.');
}
$password = bin2hex(random_bytes(18)).'aB9!';
$user = User::firstOrNew(['email' => 'f56-review@school.test']);
$user->forceFill(['name' => 'Minh Anh · Duyệt thử', 'role' => StaffRole::Moderator, 'active' => true, 'password' => $password])->save();
$submissions = app(SubmissionService::class);
$moderation = app(ModerationService::class);
$samples = [
    ['Cô Vân', "Cảm ơn cô vì buổi chiều hôm ấy đã không vội về.\n\nCô không chỉ giúp em tìm ra lỗi trong một dòng code. Cô giúp em hiểu rằng, khi một cánh cửa chưa mở, mình có thể học cách đặt một câu hỏi khác.\n\nCó những bài học không nằm trên bảng, nhưng em sẽ mang theo rất lâu.", 'Nguyễn Minh An'],
    ['Thầy Hoàng', 'Cảm ơn thầy đã tin tưởng khi em còn chưa tin vào chính mình. Những lần thầy kiên nhẫn nghe em trình bày đã giúp em dám bước lên sân khấu lần đầu tiên.', 'Mai Phương'],
    ['Cô Hạnh', 'Em vẫn nhớ lời cô: “Cứ thử lại, cô ở đây.” Cảm ơn cô đã khiến những ngày khó khăn trở nên nhẹ nhàng hơn.', 'Trần Gia Bảo'],
    ['Cô Lan', "Chúc cô một ngày 20/11 thật nhiều niềm vui.\nCảm ơn những lời động viên rất nhỏ mà em chưa từng quên.", 'Khánh Linh'],
    ['Thầy Minh', 'Cảm ơn thầy đã dạy chúng em cách lắng nghe trước khi đưa ra một câu trả lời. Đó là bài học em mang theo cả ngoài lớp học.', 'Anh Khoa'],
    ['Cô Vân', 'Có những điều sau này em mới hiểu. Cảm ơn cô vì đã chọn ở lại, khi em chỉ muốn bỏ cuộc.', 'Hải Yến'],
];
$ids = [];
for ($i = 0; $i < 18; $i++) {
    $key = 'f5600000-0000-4000-8000-'.str_pad((string) $i, 12, '0', STR_PAD_LEFT);
    // Replace only these deterministic fixtures, never other review data.
    $old = Submission::where('idempotency_hash', hash_hmac('sha256', $key, config('app.key')))->first();
    if ($old) {
        AuditEvent::where('submission_id', $old->id)->delete();
        $old->delete();
    }
    [$recipient, $message, $name] = $samples[$i % count($samples)];
    if ($i === 12) {
        $message = '<script>window.adminXss=true</script> — Văn bản kiểm tra an toàn.';
    }
    if ($i === 11) {
        $message = mb_substr(str_repeat('Cảm ơn cô vì đã lắng nghe, kiên nhẫn và luôn tin rằng mỗi người đều có thể bắt đầu lại. 💛 ', 8), 0, 500);
    }
    [$row] = $submissions->submit(['recipient' => $recipient, 'message' => $message, 'display_name' => $name, 'consent' => ['accepted' => true, 'version' => 'public-wall-v1']], $key, bin2hex(random_bytes(32)));
    $row->update(['created_at' => now()->subMinutes((18 - $i) * 7)]);
    if (in_array($i, [13, 14, 16], true)) {
        $moderation->decide($user, $row->id, 'approve', 0, null);
    }
    if ($i === 15) {
        $moderation->decide($user, $row->id, 'reject', 0, 'off_topic');
    }
    if ($i === 16) {
        $moderation->decide($user, $row->id, 'hide', 1, 'personal_data');
    }
    if ($i === 17) {
        $submissions->withdraw($row);
    }
    $ids[] = $row->id;
}
echo json_encode(['email' => $user->email, 'password' => $password, 'ids' => $ids], JSON_THROW_ON_ERROR);
