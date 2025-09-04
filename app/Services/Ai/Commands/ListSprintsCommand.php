<?php

namespace App\Services\Ai\Commands;

use App\Services\SprintService;
use App\Services\ProjectService;
use App\Models\Project;
use App\Models\User;

class ListSprintsCommand extends AbstractCommand
{
    private SprintService $sprintService;
    private ProjectService $projectService;

    public function __construct(SprintService $sprintService, ProjectService $projectService)
    {
        $this->sprintService = $sprintService;
        $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'LIST_SPRINTS';
    }

    public function getDescription(): string
    {
        return 'Получить список спринтов проекта';
    }

    public function getParametersSchema(): array
    {
        return [
            'project_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID проекта'],
            'project_name' => ['type' => 'string', 'required' => false, 'description' => 'Название проекта (для поиска)'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Фильтр по статусу (planned, active, completed)'],
            'limit' => ['type' => 'integer', 'required' => false, 'description' => 'Максимальное количество спринтов'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            // Находим проект
            $project = $this->findProject($parameters, $user);
            if (!$project) {
                return [
                    'success' => false,
                    'message' => 'Проект не найден',
                ];
            }

            // Проверяем права доступа
            if (!$this->projectService->canUserAccessProject($user, $project)) {
                return [
                    'success' => false,
                    'message' => 'Нет прав для просмотра спринтов этого проекта',
                ];
            }

            // Получаем спринты
            $sprints = $this->sprintService->getProjectSprints($project);

            // Фильтруем по статусу если указан
            if (isset($parameters['status'])) {
                $sprints = $sprints->where('status', $parameters['status']);
            }

            // Ограничиваем количество
            $limit = $parameters['limit'] ?? 10;
            $sprints = $sprints->take($limit);

            $sprintsData = $sprints->map(function ($sprint) {
                return [
                    'id' => $sprint->id,
                    'name' => $sprint->name,
                    'description' => $sprint->description,
                    'start_date' => $sprint->start_date,
                    'end_date' => $sprint->end_date,
                    'status' => $sprint->status,
                    'tasks_count' => $sprint->tasks->count(),
                    'sprint_url' => route('sprints.show', [$sprint->project, $sprint]),
                ];
            })->toArray();

            $message = "Спринты проекта '{$project->name}':\n\n";
            foreach ($sprintsData as $sprint) {
                $statusText = $this->getStatusText($sprint['status']);
                $message .= "• {$sprint['name']} ({$statusText})\n";
                $message .= "  Период: {$sprint['start_date']} - {$sprint['end_date']}\n";
                $message .= "  Задач: {$sprint['tasks_count']}\n";
                if ($sprint['description']) {
                    $message .= "  Описание: {$sprint['description']}\n";
                }
                $message .= "\n";
            }

            return [
                'success' => true,
                'message' => $message,
                'data' => [
                    'project_name' => $project->name,
                    'sprints' => $sprintsData,
                    'total_count' => $sprints->count(),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Ошибка при получении списка спринтов: ' . $e->getMessage(),
            ];
        }
    }

    private function findProject(array $parameters, User $user): ?Project
    {
        if (isset($parameters['project_id'])) {
            return Project::where('id', $parameters['project_id'])
                ->where(function($query) use ($user) {
                    $query->where('owner_id', $user->id)
                        ->orWhereHas('members', function($q) use ($user) {
                            $q->where('user_id', $user->id);
                        });
                })
                ->first();
        }

        if (isset($parameters['project_name'])) {
            return Project::where('name', 'like', '%' . $parameters['project_name'] . '%')
                ->where(function($query) use ($user) {
                    $query->where('owner_id', $user->id)
                        ->orWhereHas('members', function($q) use ($user) {
                            $q->where('user_id', $user->id);
                        });
                })
                ->first();
        }

        // Если проект не указан, берем первый доступный
        return Project::where(function($query) use ($user) {
            $query->where('owner_id', $user->id)
                ->orWhereHas('members', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
        })->first();
    }

    private function getStatusText(string $status): string
    {
        $statusMap = [
            'planned' => 'Запланирован',
            'active' => 'Активный',
            'completed' => 'Завершен',
        ];

        return $statusMap[$status] ?? $status;
    }
}
