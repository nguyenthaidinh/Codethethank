<?php

use App\Enums\StaffRole;
use App\Models\User;
use App\Models\WallDisplay;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('local') || config('database.connections.pgsql.database') !== 'gratitude_wall_review') {
    throw new RuntimeException('Only the isolated tribute review database is allowed.');
}
$password = bin2hex(random_bytes(18)).'aB9!';
// Only displays created by this isolated review script; never other stage screens.
WallDisplay::where('name', 'Tri ân · Máy chiếu duyệt')->whereNull('revoked_at')->update(['revoked_at' => now()]);
$user = User::firstOrNew(['email' => 'tribute-review@school.test']);
$user->forceFill(['name' => 'Tri ân · Duyệt thử', 'role' => StaffRole::Admin, 'active' => true, 'password' => $password])->save();
echo json_encode(['email' => $user->email, 'password' => $password], JSON_THROW_ON_ERROR);
