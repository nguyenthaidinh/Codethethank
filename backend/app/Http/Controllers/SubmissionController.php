<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitGratitudeRequest;
use App\Models\Submission;
use App\Services\SubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function store(SubmitGratitudeRequest $request, SubmissionService $service): JsonResponse
    {
        [$submission, $created] = $service->submit($request->validated(), $request->header('Idempotency-Key'), $request->header('X-Receipt-Token'));

        return response()->json(['data' => $this->summary($submission)], $created ? 201 : 200);
    }

    public function show(Request $request, string $id, SubmissionService $service): JsonResponse
    {
        return response()->json(['data' => $this->summary($service->receipt($id, $request->header('X-Receipt-Token', '')))]);
    }

    public function destroy(Request $request, string $id, SubmissionService $service): JsonResponse
    {
        $submission = $service->receipt($id, $request->header('X-Receipt-Token', ''));

        return response()->json(['data' => $this->summary($service->withdraw($submission))]);
    }

    private function summary(Submission $submission): array
    {
        return [
            'id' => $submission->id,
            'status' => $submission->status->value,
            'submitted_at' => $submission->created_at->toIso8601String(),
            'withdrawn_at' => $submission->withdrawn_at?->toIso8601String(),
        ];
    }
}
