<?php

namespace App\Console\Commands;

use App\Models\AuditEvent;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DisableStaff extends Command
{
    protected $signature = 'staff:disable {email}';

    protected $description = 'Disable a staff account and revoke all of its API tokens.';

    public function handle(): int
    {
        $found = DB::transaction(function () {
            $user = User::where('email', mb_strtolower(trim($this->argument('email'))))->lockForUpdate()->first();
            if (! $user) {
                return false;
            }
            $user->forceFill(['active' => false])->save();
            $user->tokens()->delete();
            AuditEvent::create(['actor_id' => $user->id, 'action' => 'staff.disabled']);

            return true;
        });
        $found ? $this->info('Account disabled and tokens revoked.') : $this->error('Account not found.');

        return $found ? self::SUCCESS : self::FAILURE;
    }
}
