<?php

namespace App\Services\Ai\Commands;

use App\Services\TaskService;
use App\Models\Task;
use App\Models\User;
use App\Models\Project;

class AssignTaskCommand extends AbstractCommand
{
    private TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function getName(): string
    {
        return 'ASSIGN_TASK';
    }

    public function getDescription(): string
    {
        return 'Назначить исполнителя для задачи';
    }

    public function getParametersSchema(): array
    {
        return [
            'task_id' => ['type' => 'integer', 'required' => true, 'description' => 'ID задачи'],
            'assignee_id' => ['type' => 'integer', 'required' => true, 'description' => 'ID исполнителя'],
            'assignee_name' => ['type' => 'string', 'required' => false, 'description' => 'Имя исполнителя (для поиска)'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['task_id']);

            $task = Task::with(['project', 'assignee'])->findOrFail($parameters['task_id']);
            
            if (!$this->taskService->canUserManageTask($user, $task)) {
                throw new \Exception('У вас нет прав для назначения исполнителя этой задачи');
            }

            // Определяем исполнителя
            $assignee = null;
            
            if (isset($parameters['assignee_id'])) {
                $assignee = User::find($parameters['assignee_id']);
            } elseif (isset($parameters['assignee_name'])) {
                // Ищем пользователя по имени в доступных проектах с проверкой доступа
                $assignee = User::where('name', 'like', '%' . $parameters['assignee_name'] . '%')
                    ->where(function($query) use ($task) {
                        $query->whereHas('projectMemberships', function($memberQuery) use ($task) {
                            $memberQuery->where('project_id', $task->project_id);
                        })
                        ->orWhere('id', $task->project->owner_id);
                    })
                    ->first();
            }

            if (!$assignee) {
                throw new \Exception('Исполнитель не найден');
            }

            // Проверяем, что исполнитель имеет доступ к проекту
            $projectService = new \App\Services\ProjectService();
            if (!$projectService->canUserAccessProject($assignee, $task->project)) {
                throw new \Exception('Пользователь не имеет доступа к проекту');
            }

            $task = $this->taskService->assignTask($task, $assignee);

            return $this->formatResponse(
                ['task' => $task->toArray()],
                "Задача '{$task->title}' назначена на {$assignee->name}"
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

        if (isset($parameters['task_id'])) {
            $task = Task::find($parameters['task_id']);
            return $task && $this->taskService->canUserManageTask($user, $task);
        }

        return true;
    }
} 