<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('seo_recognition_tasks', function (Blueprint $table) {
            $table->json('engine_states')->nullable()->after('external_task_id');
        });
    }

    public function down(): void
    {
        Schema::table('seo_recognition_tasks', function (Blueprint $table) {
            $table->dropColumn('engine_states');
        });
    }
};