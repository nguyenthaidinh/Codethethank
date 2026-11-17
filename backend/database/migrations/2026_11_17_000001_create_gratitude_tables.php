<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'moderator', 'operator'])->default('operator');
            $table->boolean('active')->default(false);
        });
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
        Schema::create('submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('recipient', 60)->nullable();
            $table->text('message')->nullable();
            $table->string('display_name', 40)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'hidden', 'withdrawn'])->default('pending');
            $table->string('consent_version', 40);
            $table->timestampTz('consented_at');
            $table->char('idempotency_hash', 64)->unique();
            $table->char('receipt_hash', 64)->unique();
            $table->char('payload_hash', 64);
            $table->timestampTz('withdrawn_at')->nullable();
            $table->timestampsTz();
            $table->index(['status', 'created_at']);
        });
        Schema::create('audit_events', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('submission_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 60);
            $table->timestampTz('created_at')->useCurrent();
            // Deliberately no request body, message, token, password, or IP column.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_events');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('personal_access_tokens');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['role', 'active']));
    }
};
