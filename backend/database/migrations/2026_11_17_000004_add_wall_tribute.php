<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wall_states', function (Blueprint $table) {
            $table->json('tribute')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('wall_states', fn (Blueprint $table) => $table->dropColumn('tribute'));
    }
};
