<?php

namespace App\Services\Ai\Commands;

use App\Services\TaskService;
use App\Services\ProjectService;
use App\Models\Project;
use App\Models\User;

class CreateMultipleTasksCommand extends AbstractCommand
{
    private TaskService $taskService;
    private ProjectService $projectService;

    public function __construct(TaskService $taskService, ProjectService $projectService)
    {
        $this->taskService = $taskService;
        $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'CREATE_MULTIPLE_TASKS';
    }

    public function getDescription(): string
    {
        return 'Создать несколько задач одновременно';
    }

    public function getParametersSchema(): array
    {
        return [
            'project_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID проекта'],
            'project_name' => ['type' => 'string', 'required' => false, 'description' => 'Название проекта (для поиска)'],
            'count' => ['type' => 'integer', 'required' => true, 'description' => 'Количество задач для создания'],
            'title_prefix' => ['type' => 'string', 'required' => false, 'description' => 'Префикс названия задач'],
            'title' => ['type' => 'string', 'required' => false, 'description' => 'Базовое название задачи'],
            'description' => ['type' => 'string', 'required' => false, 'description' => 'Описание задач'],
            'assignee_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID исполнителя'],
            'assignee_name' => ['type' => 'string', 'required' => false, 'description' => 'Имя исполнителя (для поиска)'],
            'assign_to_me' => ['type' => 'boolean', 'required' => false, 'description' => 'Назначить на себя'],
            'priority' => ['type' => 'string', 'required' => false, 'description' => 'Приоритет (low, medium, high, urgent)'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['count']);

            // Определяем проект
            $project = null;
            if (isset($parameters['project_id'])) {
                $project = Project::find($parameters['project_id']);
            } elseif (isset($parameters['project_name'])) {
                // Ищем проект по названию среди доступных пользователю
                $project = Project::where('name', 'like', '%' . $parameters['project_name'] . '%')
                    ->where(function($query) use ($user) {
                        $query->where('owner_id', $user->id)
                              ->orWhereHas('members', function($memberQuery) use ($user) {
                                  $memberQuery->where('user_id', $user->id);
                              });
                    })
                    ->first();
            }

            if (!$project) {
                throw new \Exception('Проект не найден. Проверьте название проекта или ID.');
            }
            
            if (!$this->projectService->canUserAccessProject($user, $project)) {
                throw new \Exception('У вас нет доступа к этому проекту');
            }

            // Определяем исполнителя
            if (isset($parameters['assign_to_me']) && $parameters['assign_to_me']) {
                $parameters['assignee_id'] = $user->id;
            } elseif (isset($parameters['assignee_name']) && !isset($parameters['assignee_id'])) {
                // Ищем пользователя по имени в проекте с проверкой доступа
                $assignee = User::where('name', 'like', '%' . $parameters['assignee_name'] . '%')
                    ->where(function($query) use ($project) {
                        $query->whereHas('projectMemberships', function($memberQuery) use ($project) {
                            $memberQuery->where('project_id', $project->id);
                        })
                        ->orWhere('id', $project->owner_id);
                    })
                    ->first();
                
                if ($assignee) {
                    // Дополнительная проверка доступа
                    $projectService = new \App\Services\ProjectService();
                    if ($projectService->canUserAccessProject($assignee, $project)) {
                        $parameters['assignee_id'] = $assignee->id;
                    }
                }
            }

            $count = (int) $parameters['count'];
            $titlePrefix = $parameters['title_prefix'] ?? '';
            $baseTitle = $parameters['title'] ?? 'Задача';
            $description = $parameters['description'] ?? null;
            
            $createdTasks = [];
            
            for ($i = 1; $i <= $count; $i++) {
                $taskTitle = $titlePrefix ? "{$titlePrefix} - {$baseTitle} {$i}" : "{$baseTitle} {$i}";
                
                $taskData = [
                    'title' => $taskTitle,
                    'description' => $description,
                    'assignee_id' => $parameters['assignee_id'] ?? null,
                    'priority' => $parameters['priority'] ?? 'medium',
                ];
                
                $task = $this->taskService->createTask($taskData, $project, $user);
                $createdTasks[] = $task;
            }

            $assigneeInfo = '';
            if (isset($parameters['assignee_id']) && $parameters['assignee_id']) {
                $assignee = User::find($parameters['assignee_id']);
                if ($assignee) {
                    $assigneeInfo = " и назначены на {$assignee->name}";
                }
            } elseif (isset($parameters['assign_to_me']) && $parameters['assign_to_me']) {
                $assigneeInfo = " и назначены на {$user->name}";
            }

            // Формируем дополнительные ссылки
            $customLinks = [
                'project' => route('projects.show', $project->id),
                'project_board' => route('projects.board', $project->id),
                'tasks_list' => route('tasks.index'),
            ];

            return $this->formatResponse(
                [
                    'tasks' => collect($createdTasks)->map(fn($task) => $task->toArray())->toArray(),
                    'project' => $project->toArray(),
                    'count' => $count
                ],
                "Создано {$count} задач в проекте '{$project->name}'{$assigneeInfo}",
                $customLinks
            );
        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    public function canExecute($user, array $parameters = []): bool
    {
        if (!parent::canExecute($user, $parameters)) {
            return false;
        }

        if (isset($parameters['project_id'])) {
            $project = Project::find($parameters['project_id']);
            return $project && $this->projectService->canUserAccessProject($user, $project);
        }

        return true;
    }
} 