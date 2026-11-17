<?php

use App\Enums\StaffRole;
use App\Models\AuditEvent;
use App\Models\User;
use App\Models\WallState;
use App\Services\LiveWallService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Process\Process;

require __DIR__.'/../vendor/autoload.php';
putenv('APP_ENV=testing');
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('testing') || config('database.default') !== 'pgsql' || config('database.connections.pgsql.database') !== 'gratitude_test') {
    throw new RuntimeException('Requires isolated gratitude_test PostgreSQL database.');
}
if (in_array('--worker', $argv, true)) {
    $data = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
    try {
        app(LiveWallService::class)->command(User::findOrFail($data['actor']), $data['action'], $data['revision']);
        echo '200';
    } catch (HttpExceptionInterface $exception) {
        if ($exception->getStatusCode() !== 409) {
            throw $exception;
        }
        echo '409';
    }
    exit;
}
$actors = [];
$original = WallState::findOrFail(1)->getAttributes();
try {
    for ($i = 0; $i < 2; $i++) {
        $actor = new User;
        $actor->forceFill(['email' => 'stage-race-'.Str::uuid().'@school.test', 'name' => 'Synthetic operator', 'role' => StaffRole::Operator, 'active' => true, 'password' => Str::random(40)])->save();
        $actors[] = $actor;
    }
    $workers = [];
    for ($i = 0; $i < 8; $i++) {
        $action = $i % 2 ? 'blank' : 'resume';
        $worker = new Process([PHP_BINARY, '-d', 'extension=pdo_pgsql', __FILE__, '--worker'], dirname(__DIR__), input: json_encode(['actor' => $actors[$i % 2]->id, 'action' => $action, 'revision' => $original['revision']], JSON_THROW_ON_ERROR), timeout: 90);
        $worker->start();
        $workers[] = [$worker, $action];
    }
    $results = [];
    foreach ($workers as [$worker, $action]) {
        $worker->wait();
        if (! $worker->isSuccessful()) {
            throw new RuntimeException($worker->getErrorOutput());
        }
        $status = (int) trim($worker->getOutput());
        if ($action === 'blank' && $status !== 200) {
            throw new RuntimeException('Emergency Blank was rejected.');
        }
        $results[] = ['action' => $action, 'status' => $status];
    }
    $final = WallState::findOrFail(1);
    if (! $final->blank || $final->current_id !== null) {
        throw new RuntimeException('A stale resume undid Emergency Blank.');
    }
    $proof = ['result' => 'PASS', 'workers' => 8, 'operators' => 2, 'final_blank' => $final->blank, 'results' => $results];
    file_put_contents(__DIR__.'/../proof-f57/concurrency.json', json_encode($proof, JSON_PRETTY_PRINT));
    echo json_encode($proof, JSON_PRETTY_PRINT).PHP_EOL;
} finally {
    WallState::whereKey(1)->update($original);
    foreach ($actors as $actor) {
        AuditEvent::where('actor_id', $actor->id)->delete();
        $actor->delete();
    }
}
