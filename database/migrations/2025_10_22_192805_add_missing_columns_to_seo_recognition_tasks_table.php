<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Сначала очищаем проблемные данные с несуществующими site_id
        $this->cleanupOrphanedRecords();
        
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
        
        // Добавляем внешние ключи только если они не существуют
        $this->addForeignKeyIfNotExists('seo_recognition_tasks', 'user_id', 'users', 'id');
        $this->addForeignKeyIfNotExists('seo_recognition_tasks', 'site_id', 'seo_sites', 'id');
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
    
    /**
     * Очищает записи с несуществующими site_id
     */
    private function cleanupOrphanedRecords()
    {
        // Удаляем записи с site_id, которых нет в таблице seo_sites
        DB::statement('DELETE FROM seo_recognition_tasks WHERE site_id NOT IN (SELECT id FROM seo_sites)');
        
        // Также удаляем записи с user_id, которых нет в таблице users
        DB::statement('DELETE FROM seo_recognition_tasks WHERE user_id NOT IN (SELECT id FROM users)');
    }
    
    /**
     * Добавляет внешний ключ только если он не существует
     */
    private function addForeignKeyIfNotExists($table, $column, $referencedTable, $referencedColumn)
    {
        $constraintName = "{$table}_{$column}_foreign";
        
        $exists = DB::select("
            SELECT COUNT(*) as count 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = ? 
            AND TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
        ", [$constraintName, $table]);
        
        if ($exists[0]->count == 0) {
            Schema::table($table, function (Blueprint $table) use ($column, $referencedTable, $referencedColumn) {
                $table->foreign($column)->references($referencedColumn)->on($referencedTable)->onDelete('cascade');
            });
        }
    }
};
