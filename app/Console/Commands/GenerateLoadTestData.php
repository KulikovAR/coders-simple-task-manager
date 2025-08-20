<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateLoadTestData extends Command
{
    protected $signature = 'load-test:generate {user_id : ID пользователя} {--projects=100 : Количество проектов} {--tasks=5000 : Количество задач в каждом проекте} {--sprints=10 : Количество спринтов в каждом проекте}';
    protected $description = 'Генерирует тестовые данные для нагрузочного тестирования';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $projectsCount = $this->option('projects');
        $tasksCount = $this->option('tasks');
        $sprintsCount = $this->option('sprints');

        $user = User::find($userId);
        if (!$user) {
            $this->error('Пользователь не найден');
            return 1;
        }

        $this->info('Начинаем генерацию тестовых данных...');
        $bar = $this->output->createProgressBar($projectsCount);

        DB::beginTransaction();
        try {
            // Создаем базовые статусы для задач, если их нет
            $statuses = $this->ensureTaskStatuses($user->id);
            
            // Генерируем проекты
            for ($p = 0; $p < $projectsCount; $p++) {
                $project = Project::create([
                    'name' => "Тестовый проект " . ($p + 1),
                    'description' => "Проект для нагрузочного тестирования #" . ($p + 1),
                    'owner_id' => $user->id,
                ]);

                // Создаем спринты для проекта
                $sprints = [];
                for ($s = 0; $s < $sprintsCount; $s++) {
                    $startDate = now()->addDays($s * 14);
                    $sprint = Sprint::create([
                        'project_id' => $project->id,
                        'name' => "Спринт " . ($s + 1),
                        'description' => "Тестовый спринт #" . ($s + 1),
                        'start_date' => $startDate,
                        'end_date' => $startDate->copy()->addDays(13),
                        'status' => 'active'
                    ]);
                    $sprints[] = $sprint->id;
                }

                // Создаем задачи, распределяя их по спринтам
                $tasksPerSprint = ceil($tasksCount / count($sprints));
                $taskCounter = 0;

                foreach ($sprints as $sprintId) {
                    $tasksToCreate = min($tasksPerSprint, $tasksCount - $taskCounter);
                    
                    for ($t = 0; $t < $tasksToCreate; $t++) {
                        Task::create([
                            'project_id' => $project->id,
                            'sprint_id' => $sprintId,
                            'title' => "Задача " . ($taskCounter + 1),
                            'description' => "Тестовая задача #" . ($taskCounter + 1),
                            'assignee_id' => $user->id,
                            'reporter_id' => $user->id,
                            'priority' => array_random(['low', 'medium', 'high', 'critical']),
                            'status_id' => array_random($statuses),
                        ]);
                        $taskCounter++;
                    }
                }

                $bar->advance();
            }

            DB::commit();
            $bar->finish();
            
            $this->newLine();
            $this->info('Генерация завершена успешно!');
            $this->table(
                ['Тип', 'Количество'],
                [
                    ['Проекты', $projectsCount],
                    ['Спринты', $projectsCount * $sprintsCount],
                    ['Задачи', $projectsCount * $tasksCount],
                ]
            );

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Произошла ошибка: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    private function ensureTaskStatuses($userId)
    {
        $statusNames = ['Новая', 'В работе', 'На проверке', 'Готово'];
        $statusIds = [];

        // Получаем первый проект пользователя или создаем новый
        $project = Project::firstOrCreate(
            ['owner_id' => $userId],
            [
                'name' => 'Основной проект',
                'description' => 'Проект для базовых статусов'
            ]
        );

        foreach ($statusNames as $index => $name) {
            $status = TaskStatus::firstOrCreate(
                [
                    'name' => $name,
                    'project_id' => $project->id
                ],
                [
                    'color' => '#' . dechex(rand(0x000000, 0xFFFFFF)),
                    'order' => $index,
                    'created_by' => $userId,
                ]
            );
            $statusIds[] = $status->id;
        }

        return $statusIds;
    }
}

function array_random($array) {
    return $array[array_rand($array)];
}
