<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->enum('publication_mode', ['moderated', 'instant'])->default('moderated');
            $table->timestampTz('wall_presented_at')->nullable()->index();
        });
        Schema::create('wall_states', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->enum('mode', ['auto', 'manual'])->default('auto');
            $table->boolean('blank')->default(true);
            $table->boolean('effects')->default(true);
            $table->unsignedBigInteger('revision')->default(0);
            $table->foreignUuid('current_id')->nullable()->constrained('submissions')->nullOnDelete();
            $table->timestampTz('started_at')->nullable();
            $table->timestampsTz();
        });
        DB::table('wall_states')->insert(['id' => 1, 'mode' => 'auto', 'blank' => true, 'effects' => true, 'revision' => 0, 'created_at' => now(), 'updated_at' => now()]);
        Schema::create('wall_displays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 80);
            $table->char('token_hash', 64)->unique();
            $table->timestampTz('expires_at');
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampTz('last_seen_at')->nullable();
            $table->unsignedBigInteger('ack_revision')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wall_displays');
        Schema::dropIfExists('wall_states');
        Schema::table('submissions', fn (Blueprint $table) => $table->dropColumn(['publication_mode', 'wall_presented_at']));
    }
};
