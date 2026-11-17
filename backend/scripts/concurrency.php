<?php

// Only synthetic data, only gratitude_test. Independent processes exercise PostgreSQL locks.
use App\Enums\SubmissionStatus;
use App\Models\AuditEvent;
use App\Models\Submission;
use App\Services\SubmissionService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

require __DIR__.'/../vendor/autoload.php';
putenv('APP_ENV=testing');
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('testing') || config('database.default') !== 'pgsql' || config('database.connections.pgsql.database') !== 'gratitude_test') {
    throw new RuntimeException('This script requires the isolated PostgreSQL gratitude_test database.');
}
$service = $app->make(SubmissionService::class);
if (in_array('--worker', $argv, true)) {
    $input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
    if ($input['operation'] === 'submit') {
        [$row, $created] = $service->submit($input['payload'], $input['key'], $input['receipt']);
        echo json_encode(['id' => $row->id, 'created' => $created], JSON_THROW_ON_ERROR);
    } else {
        $row = $service->withdraw($service->receipt($input['id'], $input['receipt']));
        echo json_encode(['status' => $row->status->value], JSON_THROW_ON_ERROR);
    }
    exit(0);
}

$input = [
    'operation' => 'submit', 'key' => (string) Str::uuid(), 'receipt' => bin2hex(random_bytes(32)),
    'payload' => ['recipient' => 'QA teacher', 'message' => 'Synthetic concurrent submission', 'display_name' => 'QA', 'consent' => ['accepted' => true, 'version' => 'public-wall-v1']],
];
$run = function (array $input): array {
    $workers = [];
    for ($i = 0; $i < 8; $i++) {
        $process = new Process([PHP_BINARY, '-d', 'extension=pdo_pgsql', __FILE__, '--worker'], dirname(__DIR__), input: json_encode($input, JSON_THROW_ON_ERROR), timeout: 60);
        $process->start();
        $workers[] = $process;
    }

    return array_map(function (Process $process) {
        $process->wait();
        if (! $process->isSuccessful()) {
            throw new RuntimeException('Concurrent worker failed: '.$process->getErrorOutput());
        }

        return json_decode($process->getOutput(), true, 512, JSON_THROW_ON_ERROR);
    }, $workers);
};
$id = null;
try {
    $results = $run($input);
    $ids = array_unique(array_column($results, 'id'));
    $created = count(array_filter($results, fn ($result) => $result['created']));
    if (count($ids) !== 1 || $created !== 1) {
        throw new RuntimeException('Concurrent retries did not converge on one creation.');
    }
    $id = $ids[0];
    if (AuditEvent::where('submission_id', $id)->count() !== 1) {
        throw new RuntimeException('Duplicate creation audit.');
    }
    $withdrawals = $run(['operation' => 'withdraw', 'id' => $id, 'receipt' => $input['receipt']]);
    $row = Submission::findOrFail($id);
    if ($row->status !== SubmissionStatus::Withdrawn || $row->message !== null || AuditEvent::where('submission_id', $id)->count() !== 2) {
        throw new RuntimeException('Concurrent withdrawal did not scrub once.');
    }
    $proof = ['database' => 'gratitude_test', 'engine' => DB::selectOne('select version() as version')->version, 'submit_workers' => count($results), 'created' => $created, 'distinct_ids' => count($ids), 'withdraw_workers' => count($withdrawals), 'audit_events' => 2, 'content_scrubbed' => true];
    file_put_contents(__DIR__.'/../proof/concurrency.json', json_encode($proof, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    echo json_encode($proof, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
} finally {
    // Remove only this script's randomly identified fixture; never truncate shared tables.
    $row = Submission::where('idempotency_hash', hash_hmac('sha256', $input['key'], config('app.key')))->first();
    if ($row) {
        AuditEvent::where('submission_id', $row->id)->delete();
        $row->delete();
    }
}
