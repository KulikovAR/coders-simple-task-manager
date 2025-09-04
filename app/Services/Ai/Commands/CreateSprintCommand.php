<?php

namespace App\Services\Ai\Commands;

use App\Services\SprintService;
use App\Services\ProjectService;
use App\Services\TaskStatusService;
use App\Models\Project;
use App\Models\User;

class CreateSprintCommand extends AbstractCommand
{
    private SprintService $sprintService;
    private ProjectService $projectService;
    private TaskStatusService $taskStatusService;

    public function __construct(
        SprintService $sprintService, 
        ProjectService $projectService,
        TaskStatusService $taskStatusService
    ) {
        $this->sprintService = $sprintService;
        $this->projectService = $projectService;
        $this->taskStatusService = $taskStatusService;
    }

    public function getName(): string
    {
        return 'CREATE_SPRINT';
    }

    public function getDescription(): string
    {
        return 'Создать новый спринт в проекте';
    }

    public function getParametersSchema(): array
    {
        return [
            'project_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID проекта'],
            'project_name' => ['type' => 'string', 'required' => false, 'description' => 'Название проекта (для поиска)'],
            'name' => ['type' => 'string', 'required' => true, 'description' => 'Название спринта'],
            'description' => ['type' => 'string', 'required' => false, 'description' => 'Описание спринта'],
            'start_date' => ['type' => 'string', 'required' => true, 'description' => 'Дата начала спринта (Y-m-d)'],
            'end_date' => ['type' => 'string', 'required' => true, 'description' => 'Дата окончания спринта (Y-m-d)'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Статус спринта (planned, active, completed)'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['name', 'start_date', 'end_date']);

            // Находим проект
            $project = $this->findProject($parameters, $user);
            if (!$project) {
                return [
                    'success' => false,
                    'message' => 'Проект не найден',
                ];
            }

            // Проверяем права доступа
            if (!$this->projectService->canUserContributeToProject($user, $project)) {
                return [
                    'success' => false,
                    'message' => 'Нет прав для создания спринта в этом проекте',
                ];
            }

            // Валидируем даты
            $startDate = \Carbon\Carbon::parse($parameters['start_date']);
            $endDate = \Carbon\Carbon::parse($parameters['end_date']);

            if ($startDate->isPast() && !$startDate->isToday()) {
                return [
                    'success' => false,
                    'message' => 'Дата начала спринта не может быть в прошлом',
                ];
            }

            if ($endDate->lte($startDate)) {
                return [
                    'success' => false,
                    'message' => 'Дата окончания должна быть после даты начала',
                ];
            }

            // Подготавливаем данные для создания спринта
            $sprintData = [
                'name' => $parameters['name'],
                'description' => $parameters['description'] ?? null,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'status' => $parameters['status'] ?? 'planned',
            ];

            // Создаем спринт
            $sprint = $this->sprintService->createSprint($sprintData, $project);

            // Создаем кастомные статусы для спринта (как в веб-интерфейсе)
            $this->taskStatusService->createCustomSprintStatuses($sprint);

            return [
                'success' => true,
                'message' => "Спринт '{$sprint->name}' успешно создан в проекте '{$project->name}'",
                'data' => [
                    'sprint_id' => $sprint->id,
                    'sprint_name' => $sprint->name,
                    'project_name' => $project->name,
                    'start_date' => $sprint->start_date,
                    'end_date' => $sprint->end_date,
                    'status' => $sprint->status,
                    'sprint_url' => route('sprints.show', [$project, $sprint]),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Ошибка при создании спринта: ' . $e->getMessage(),
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

        return null;
    }
}
