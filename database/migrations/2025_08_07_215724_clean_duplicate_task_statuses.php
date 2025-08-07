<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\TaskStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Маппинг статусов для устранения дублирования
        $statusMapping = [
            'To Do' => 'К выполнению',
            'In Progress' => 'В работе', 
            'Review' => 'На проверке',
            'Testing' => 'Тестирование',
            'Ready for Release' => 'Готов к релизу',
            'Done' => 'Завершена',
        ];

        // Для каждого проекта
        $projects = \App\Models\Project::all();
        
        foreach ($projects as $project) {
            foreach ($statusMapping as $englishName => $russianName) {
                // Находим статусы с английским и русским названиями
                $englishStatus = TaskStatus::where('project_id', $project->id)
                    ->where('name', $englishName)
                    ->first();
                    
                $russianStatus = TaskStatus::where('project_id', $project->id)
                    ->where('name', $russianName)
                    ->first();

                if ($englishStatus && $russianStatus) {
                    // Если есть оба статуса, обновляем задачи с английского на русский
                    \App\Models\Task::where('status_id', $englishStatus->id)
                        ->update(['status_id' => $russianStatus->id]);
                    
                    // Удаляем английский статус
                    $englishStatus->delete();
                } elseif ($englishStatus && !$russianStatus) {
                    // Если есть только английский, переименовываем его
                    $englishStatus->update(['name' => $russianName]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Восстанавливаем английские названия
        $statusMapping = [
            'К выполнению' => 'To Do',
            'В работе' => 'In Progress',
            'На проверке' => 'Review',
            'Тестирование' => 'Testing',
            'Готов к релизу' => 'Ready for Release',
            'Завершена' => 'Done',
        ];

        foreach ($statusMapping as $russianName => $englishName) {
            TaskStatus::where('name', $russianName)
                ->update(['name' => $englishName]);
        }
    }
};
