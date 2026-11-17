<?php

use App\Enums\StaffRole;
use App\Models\AuditEvent;
use App\Models\User;
use App\Services\ModerationService;
use App\Services\SubmissionService;
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
        app(ModerationService::class)->decide(User::findOrFail($data['actor']), $data['id'], $data['action'], 0, 'spam');
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
$row = null;
try {
    for ($i = 0; $i < 2; $i++) {
        $actor = new User;
        $actor->forceFill(['email' => 'race-'.Str::uuid().'@school.test', 'name' => 'Synthetic moderator', 'role' => StaffRole::Moderator, 'active' => true, 'password' => Str::random(40)])->save();
        $actors[] = $actor;
    }
    [$row] = app(SubmissionService::class)->submit(['recipient' => 'QA teacher', 'message' => 'Synthetic concurrency letter', 'display_name' => 'QA', 'consent' => ['accepted' => true, 'version' => 'public-wall-v1']], (string) Str::uuid(), bin2hex(random_bytes(32)));
    $workers = [];
    for ($i = 0; $i < 8; $i++) {
        $worker = new Process([PHP_BINARY, '-d', 'extension=pdo_pgsql', __FILE__, '--worker'], dirname(__DIR__), input: json_encode(['actor' => $actors[$i % 2]->id, 'id' => $row->id, 'action' => $i % 2 ? 'reject' : 'approve'], JSON_THROW_ON_ERROR), timeout: 90);
        $worker->start();
        $workers[] = $worker;
    }
    $statuses = [];
    foreach ($workers as $worker) {
        $worker->wait();
        if (! $worker->isSuccessful()) {
            throw new RuntimeException($worker->getErrorOutput());
        }
        $statuses[] = (int) trim($worker->getOutput());
    }
    $totals = array_count_values($statuses);
    if (($totals[200] ?? 0) !== 1 || ($totals[409] ?? 0) !== 7 || $row->fresh()->moderation_version !== 1 || AuditEvent::where('submission_id', $row->id)->count() !== 2) {
        throw new RuntimeException('Concurrent decisions did not converge on a single audit/revision.');
    }
    $proof = ['result' => 'PASS', 'workers' => 8, 'moderators' => 2, 'accepted' => 1, 'conflicts' => 7, 'revision' => 1, 'audit_events_including_submission' => 2];
    file_put_contents(__DIR__.'/../proof-f56/concurrency.json', json_encode($proof, JSON_PRETTY_PRINT));
    echo json_encode($proof, JSON_PRETTY_PRINT).PHP_EOL;
} finally {
    if ($row) {
        AuditEvent::where('submission_id', $row->id)->delete();
        $row->delete();
    }
    foreach ($actors as $actor) {
        $actor->delete();
    }
}
