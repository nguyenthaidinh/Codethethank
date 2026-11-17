<?php

namespace App\Console\Commands;

use App\Enums\StaffRole;
use App\Models\AuditEvent;
use App\Models\User;
use App\Rules\BcryptPasswordLength;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CreateStaff extends Command
{
    protected $signature = 'staff:create {email} {--name=} {--role=moderator}';

    protected $description = 'Create an active staff account; password is read from a hidden prompt, never arguments.';

    public function handle(): int
    {
        $input = ['email' => mb_strtolower(trim($this->argument('email'))), 'name' => $this->option('name'), 'role' => $this->option('role')];
        $validator = Validator::make($input, ['email' => ['required', 'email', 'max:254', 'unique:users,email'], 'name' => ['required', 'string', 'max:100'], 'role' => [Rule::enum(StaffRole::class)]]);
        if ($validator->fails()) {
            $this->error($validator->errors()->first());

            return self::FAILURE;
        }
        $password = $this->secret('Password (at least 12 characters, mixed case and numbers)');
        $valid = Validator::make(['password' => $password], ['password' => ['required', 'string', new BcryptPasswordLength, Password::min(12)->mixedCase()->numbers()]]);
        if ($valid->fails() || $password !== $this->secret('Confirm password')) {
            $this->error('Password requirements or confirmation failed.');

            return self::FAILURE;
        }
        DB::transaction(function () use ($input, $password) {
            $user = new User;
            $user->forceFill($input + ['password' => $password, 'active' => true])->save();
            AuditEvent::create(['actor_id' => $user->id, 'action' => 'staff.provisioned']);
        });
        $this->info('Staff account created. No token has been issued.');

        return self::SUCCESS;
    }
}
