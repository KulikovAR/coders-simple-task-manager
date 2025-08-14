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
        Schema::table('task_statuses', function (Blueprint $table) {
            // Удаляем старый индекс, который блокирует создание статусов спринтов
            $table->dropUnique(['project_id', 'name']);
            
            // Создаем новый уникальный индекс с учетом sprint_id
            $table->unique(['project_id', 'sprint_id', 'name'], 'task_statuses_project_sprint_name_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_statuses', function (Blueprint $table) {
            // Удаляем новый индекс
            $table->dropUnique('task_statuses_project_sprint_name_unique');
            
            // Восстанавливаем старый индекс
            $table->unique(['project_id', 'name'], 'task_statuses_project_id_name_unique');
        });
    }
};