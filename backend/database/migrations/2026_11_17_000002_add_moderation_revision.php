<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', fn (Blueprint $table) => $table->unsignedInteger('moderation_version')->default(0));
        Schema::table('audit_events', function (Blueprint $table) {
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20)->nullable();
            $table->string('reason_code', 40)->nullable();
            $table->unsignedInteger('moderation_version')->nullable();
            $table->index(['submission_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::table('audit_events', function (Blueprint $table) {
            $table->dropIndex(['submission_id', 'id']);
            $table->dropColumn(['from_status', 'to_status', 'reason_code', 'moderation_version']);
        });
        Schema::table('submissions', fn (Blueprint $table) => $table->dropColumn('moderation_version'));
    }
};
