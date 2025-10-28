<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seo_recognition_tasks', function (Blueprint $table) {
            $table->integer('progress_percent')->default(0)->after('processed_keywords');
        });

        Schema::table('wordstat_recognition_tasks', function (Blueprint $table) {
            $table->integer('progress_percent')->default(0)->after('processed_keywords');
        });
    }

    public function down(): void
    {
        Schema::table('seo_recognition_tasks', function (Blueprint $table) {
            $table->dropColumn('progress_percent');
        });

        Schema::table('wordstat_recognition_tasks', function (Blueprint $table) {
            $table->dropColumn('progress_percent');
        });
    }
};
