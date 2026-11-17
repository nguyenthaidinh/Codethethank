<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WallState extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['blank' => 'boolean', 'effects' => 'boolean', 'revision' => 'integer', 'started_at' => 'immutable_datetime', 'tribute' => 'array'];
    }
}
