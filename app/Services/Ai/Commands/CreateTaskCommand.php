<?php

namespace App\Services\Ai\Commands;

use App\Services\TaskService;
use App\Services\ProjectService;
use App\Models\Project;
use App\Models\User;

class CreateTaskCommand extends AbstractCommand
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
        return 'CREATE_TASK';
    }

    public function getDescription(): string
    {
        return 'Создать новую задачу';
    }

    public function getParametersSchema(): array
    {
        return [
            'project_id' => ['type' => 'integer', 'required' => true, 'description' => 'ID проекта'],
            'sprint_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID спринта'],
            'title' => ['type' => 'string', 'required' => true, 'description' => 'Название задачи'],
            'description' => ['type' => 'string', 'required' => false, 'description' => 'Описание задачи'],
            'assignee_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID исполнителя'],
            'assignee_name' => ['type' => 'string', 'required' => false, 'description' => 'Имя исполнителя (для поиска)'],
            'assign_to_me' => ['type' => 'boolean', 'required' => false, 'description' => 'Назначить на себя'],
            'priority' => ['type' => 'string', 'required' => false, 'description' => 'Приоритет (low, medium, high, urgent)'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['project_id', 'title']);

            $project = Project::findOrFail($parameters['project_id']);
            
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

            $task = $this->taskService->createTask($parameters, $project, $user);

            $assigneeInfo = '';
            if ($task->assignee) {
                $assigneeInfo = " и назначена на {$task->assignee->name}";
            }

            return $this->formatResponse(
                ['task' => $task->toArray(), 'project' => $project->toArray()],
                "Задача '{$task->title}' успешно создана в проекте '{$project->name}'{$assigneeInfo}"
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