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
        Schema::table('seo_recognition_tasks', function (Blueprint $table) {
            // Проверяем существование колонок перед добавлением
            if (!Schema::hasColumn('seo_recognition_tasks', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable();
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'site_id')) {
                $table->unsignedBigInteger('site_id')->nullable();
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'status')) {
                $table->string('status')->default('pending');
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'search_engines')) {
                $table->json('search_engines')->nullable();
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'total_keywords')) {
                $table->integer('total_keywords')->default(0);
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'processed_keywords')) {
                $table->integer('processed_keywords')->default(0);
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'error_message')) {
                $table->text('error_message')->nullable();
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'started_at')) {
                $table->timestamp('started_at')->nullable();
            }
            if (!Schema::hasColumn('seo_recognition_tasks', 'completed_at')) {
                $table->timestamp('completed_at')->nullable();
            }
        });
        
        // Добавляем внешние ключи только если колонки существуют
        Schema::table('seo_recognition_tasks', function (Blueprint $table) {
            if (Schema::hasColumn('seo_recognition_tasks', 'user_id') && !Schema::hasColumn('seo_recognition_tasks', 'seo_recognition_tasks_user_id_foreign')) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }
            if (Schema::hasColumn('seo_recognition_tasks', 'site_id') && !Schema::hasColumn('seo_recognition_tasks', 'seo_recognition_tasks_site_id_foreign')) {
                $table->foreign('site_id')->references('id')->on('seo_sites')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seo_recognition_tasks', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['site_id']);
            
            $table->dropColumn([
                'user_id',
                'site_id', 
                'status',
                'search_engines',
                'total_keywords',
                'processed_keywords',
                'error_message',
                'started_at',
                'completed_at'
            ]);
        });
    }
};
