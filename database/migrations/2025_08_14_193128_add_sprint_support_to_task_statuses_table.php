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

        // Добавляем индекс для быстрого поиска статусов спринта
        // Используем try-catch для избежания ошибки если индекс уже существует
        try {
            Schema::table('task_statuses', function (Blueprint $table) {
                $table->index(['sprint_id', 'order'], 'task_statuses_sprint_order_index');
            });
        } catch (\Exception $e) {
            // Индекс уже существует, игнорируем ошибку
        }

        // Добавляем составной индекс для уникальности с учетом спринтов
        try {
            Schema::table('task_statuses', function (Blueprint $table) {
                $table->index(['project_id', 'sprint_id', 'name'], 'task_statuses_project_sprint_name_index');
            });
        } catch (\Exception $e) {
            // Индекс уже существует, игнорируем ошибку
        }
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