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
        // Проверяем, существует ли уже колонка sprint_id
        if (!Schema::hasColumn('task_statuses', 'sprint_id')) {
            Schema::table('task_statuses', function (Blueprint $table) {
                // Добавляем поддержку спринтов (nullable - статусы проекта не привязаны к спринту)
                $table->foreignId('sprint_id')->nullable()->after('project_id')->constrained()->onDelete('cascade');
            });
        }

        // Проверяем, существует ли уже колонка is_custom
        if (!Schema::hasColumn('task_statuses', 'is_custom')) {
            Schema::table('task_statuses', function (Blueprint $table) {
                // Добавляем флаг кастомизации (false для дефолтных статусов проекта)
                $table->boolean('is_custom')->default(false)->after('color');
            });
        }

        Schema::table('task_statuses', function (Blueprint $table) {
            // Индекс для быстрого поиска статусов спринта (если не существует)
            if (!collect(\DB::select("SHOW INDEX FROM task_statuses WHERE Key_name = 'task_statuses_sprint_order_index'"))->count()) {
                $table->index(['sprint_id', 'order'], 'task_statuses_sprint_order_index');
            }
        });

        // В отдельной операции работаем с unique индексом
        // ВРЕМЕННО оставляем старый индекс, создаем только новый
        Schema::table('task_statuses', function (Blueprint $table) {
            // Проверяем существование нового индекса и создаем его
            $newIndexExists = collect(\DB::select("SHOW INDEX FROM task_statuses WHERE Key_name = 'task_statuses_project_sprint_name_unique'"))->count() > 0;
            if (!$newIndexExists) {
                // Создаем новый индекс для уникальности с учетом спринтов
                // Пока оставляем и старый индекс, чтобы не нарушить внешние ключи
                $table->index(['project_id', 'sprint_id', 'name'], 'task_statuses_project_sprint_name_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_statuses', function (Blueprint $table) {
            // Удаляем новые индексы
            $table->dropIndex('task_statuses_project_sprint_name_unique');
            $table->dropIndex('task_statuses_sprint_order_index');
            
            // Восстанавливаем старый индекс
            $table->unique(['project_id', 'name']);
            
            // Удаляем новые колонки
            $table->dropForeign(['sprint_id']);
            $table->dropColumn(['sprint_id', 'is_custom']);
        });
    }
};