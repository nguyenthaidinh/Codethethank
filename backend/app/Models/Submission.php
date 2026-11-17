<?php

namespace App\Models;

use App\Enums\SubmissionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasUuids;

    protected $guarded = ['id'];

    // A controller must explicitly choose what to disclose, even to staff later.
    protected $visible = ['id', 'status', 'created_at', 'withdrawn_at'];

    protected function casts(): array
    {
        return ['status' => SubmissionStatus::class, 'consented_at' => 'immutable_datetime', 'withdrawn_at' => 'immutable_datetime', 'moderation_version' => 'integer'];
    }
}
