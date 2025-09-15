<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Поля для Гантт диаграмм
            $table->date('start_date')->nullable()->after('deadline');
            $table->integer('duration_days')->nullable()->after('start_date');
            $table->integer('progress_percent')->default(0)->after('duration_days');
            $table->boolean('is_milestone')->default(false)->after('progress_percent');
            $table->integer('sort_order')->nullable()->after('is_milestone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'start_date',
                'duration_days', 
                'progress_percent',
                'is_milestone',
                'sort_order'
            ]);
        });
    }
};
