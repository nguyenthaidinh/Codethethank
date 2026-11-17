<?php

namespace App\Services;

use App\Enums\SubmissionStatus;
use App\Models\AuditEvent;
use App\Models\Submission;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class SubmissionService
{
    /** @return array{Submission, bool} */
    public function submit(array $data, string $idempotencyKey, string $receiptToken): array
    {
        $payload = [
            'recipient' => $data['recipient'],
            'message' => $data['message'],
            'display_name' => $data['display_name'] ?? null,
            'consent_version' => $data['consent']['version'],
        ];
        $keyHash = hash_hmac('sha256', $idempotencyKey, config('app.key'));
        $payloadHash = hash_hmac('sha256', json_encode($payload, JSON_THROW_ON_ERROR), config('app.key'));
        $receiptHash = hash('sha256', $receiptToken);

        if ($existing = Submission::where('idempotency_hash', $keyHash)->first()) {
            return [$this->replay($existing, $receiptHash, $payloadHash), false];
        }

        try {
            $submission = DB::transaction(function () use ($payload, $keyHash, $receiptHash, $payloadHash) {
                $submission = Submission::create($payload + [
                    'status' => $payload['consent_version'] === 'public-wall-live-v2' ? SubmissionStatus::Approved : SubmissionStatus::Pending,
                    'publication_mode' => $payload['consent_version'] === 'public-wall-live-v2' ? 'instant' : 'moderated',
                    'consented_at' => now(),
                    'idempotency_hash' => $keyHash,
                    'receipt_hash' => $receiptHash,
                    'payload_hash' => $payloadHash,
                ]);
                AuditEvent::create(['submission_id' => $submission->id, 'action' => $submission->publication_mode === 'instant' ? 'submission.published' : 'submission.created']);

                return $submission;
            });

            return [$submission, true];
        } catch (UniqueConstraintViolationException $exception) {
            // Read outside the rolled-back transaction: PostgreSQL aborts failed transactions.
            $existing = Submission::where('idempotency_hash', $keyHash)->first();
            abort_unless($existing, 409, 'Receipt token has already been used.');

            return [$this->replay($existing, $receiptHash, $payloadHash), false];
        }
    }

    private function replay(Submission $submission, string $receiptHash, string $payloadHash): Submission
    {
        abort_unless(hash_equals($submission->receipt_hash, $receiptHash) && hash_equals($submission->payload_hash, $payloadHash), 409, 'Submission key conflicts with an earlier request.');

        return $submission;
    }

    public function receipt(string $id, string $token): Submission
    {
        abort_unless(preg_match('/^[0-9a-f]{64}$/D', $token), 404);
        $submission = Submission::find($id);
        abort_unless($submission && hash_equals($submission->receipt_hash, hash('sha256', $token)), 404);

        return $submission;
    }

    public function withdraw(Submission $submission): Submission
    {
        return DB::transaction(function () use ($submission) {
            $locked = Submission::whereKey($submission->id)->lockForUpdate()->firstOrFail();
            if ($locked->status !== SubmissionStatus::Withdrawn) {
                $locked->update([
                    'status' => SubmissionStatus::Withdrawn,
                    'recipient' => null, 'message' => null, 'display_name' => null,
                    'withdrawn_at' => now(),
                ]);
                AuditEvent::create(['submission_id' => $locked->id, 'action' => 'submission.withdrawn']);
            }

            return $locked;
        });
    }
}
