<?php

use App\Enums\StaffRole;
use App\Models\User;
use App\Models\WallState;
use App\Services\SubmissionService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('local') || config('database.connections.pgsql.database') !== 'gratitude_wall_review') {
    throw new RuntimeException('Only the isolated gratitude_wall_review database is allowed.');
}
$password = bin2hex(random_bytes(18)).'aB9!';
$user = User::firstOrNew(['email' => 'f57-review@school.test']);
$user->forceFill(['name' => 'Sân khấu · Duyệt thử', 'role' => StaffRole::Admin, 'active' => true, 'password' => $password])->save();
$samples = [
    ['Cô Vân', 'Cảm ơn cô đã chọn ở lại, khi em chỉ muốn bỏ cuộc. Có những bài học không nằm trên bảng, nhưng em sẽ mang theo rất lâu.', 'Minh An'],
    ['Thầy Hoàng', 'Cảm ơn thầy đã tin tưởng khi em còn chưa tin vào chính mình. Chúc thầy luôn giữ được ngọn lửa ấy.', 'Mai Phương'],
    ['Cô Hạnh', 'Em vẫn nhớ lời cô: “Cứ thử lại, cô ở đây.” Cảm ơn cô đã khiến những ngày khó khăn trở nên nhẹ nhàng hơn.', 'Gia Bảo'],
    ['Cô Lan', 'Chúc cô một ngày 20/11 thật nhiều niềm vui. Những lời động viên rất nhỏ của cô, em chưa từng quên.', 'Khánh Linh'],
    ['Thầy Minh', 'Cảm ơn thầy đã dạy chúng em cách lắng nghe. Đó là bài học em mang theo cả ngoài lớp học.', 'Anh Khoa'],
    ['Những người thầy', 'Mong những điều dịu dàng chúng em nhận được sẽ trở thành ánh sáng để trao tiếp cho một người khác.', 'Hải Yến'],
];
foreach ($samples as $i => [$recipient, $message, $name]) {
    app(SubmissionService::class)->submit(['recipient' => $recipient, 'message' => $message, 'display_name' => $name, 'consent' => ['accepted' => true, 'version' => 'public-wall-live-v2']], 'f5700000-0000-4000-8000-'.str_pad((string) $i, 12, '0', STR_PAD_LEFT), hash('sha256', 'wall-review-only-'.$i));
}
WallState::findOrFail(1)->update(['blank' => false, 'mode' => 'auto', 'effects' => true, 'current_id' => null, 'started_at' => null, 'revision' => WallState::find(1)->revision + 1]);
echo json_encode(['email' => $user->email, 'password' => $password], JSON_THROW_ON_ERROR);
