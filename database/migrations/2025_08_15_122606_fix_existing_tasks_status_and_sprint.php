<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
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
        DB::transaction(function () {
            // Получаем все задачи
            $tasks = Task::with(['project'])->get();
            
            foreach ($tasks as $task) {
                // Убираем спринт у задачи
                $task->sprint_id = null;
                
                // Находим первый статус проекта (по порядку)
                $firstProjectStatus = TaskStatus::where('project_id', $task->project_id)
                    ->whereNull('sprint_id') // Только статусы проекта, не спринта
                    ->orderBy('order')
                    ->first();
                
                if ($firstProjectStatus) {
                    $task->status_id = $firstProjectStatus->id;
                }
                
                $task->save();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Нельзя полностью откатить эту миграцию, так как мы не знаем 
        // оригинальные значения sprint_id и status_id для каждой задачи
        // Этот метод оставляем пустым для безопасности
    }
};