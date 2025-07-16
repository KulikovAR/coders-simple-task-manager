<?php

use App\Enums\TaskStatusType;
use App\Models\Project;
use App\Models\TaskStatus;
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
        // Получаем все проекты
        $projects = Project::all();

        foreach ($projects as $project) {
            // Получаем существующие статусы
            $existingStatuses = $project->taskStatuses()->pluck('name')->toArray();
            
            // Получаем все статусы из enum
            $allStatuses = TaskStatusType::getDefaultStatuses();
            
            // Добавляем только те статусы, которых еще нет
            foreach ($allStatuses as $status) {
                if (!in_array($status['name'], $existingStatuses)) {
                    TaskStatus::create([
                        'project_id' => $project->id,
                        'name' => $status['name'],
                        'order' => $status['order'],
                        'color' => $status['color'],
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Удаляем новые статусы (Testing и Ready for Release)
        TaskStatus::whereIn('name', [
            TaskStatusType::TESTING->value,
            TaskStatusType::READY_FOR_RELEASE->value
        ])->delete();
    }
};
