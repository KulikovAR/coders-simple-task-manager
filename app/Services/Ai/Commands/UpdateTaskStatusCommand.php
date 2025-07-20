<?php

namespace App\Services\Ai\Commands;

use App\Services\TaskService;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;

class UpdateTaskStatusCommand extends AbstractCommand
{
    private TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function getName(): string
    {
        return 'UPDATE_TASK_STATUS';
    }

    public function getDescription(): string
    {
        return 'Обновить статус задачи';
    }

    public function getParametersSchema(): array
    {
        return [
            'id' => ['type' => 'integer', 'required' => true, 'description' => 'ID задачи'],
            'status' => ['type' => 'string', 'required' => true, 'description' => 'Новый статус'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['id', 'status']);

            $task = Task::with(['project', 'status'])->findOrFail($parameters['id']);
            
            if (!$this->taskService->canUserManageTask($user, $task)) {
                throw new \Exception('У вас нет прав для изменения статуса этой задачи');
            }

            $status = $task->project->taskStatuses()->where('name', $parameters['status'])->first();
            if (!$status) {
                throw new \Exception("Статус '{$parameters['status']}' не найден в проекте");
            }

            $task = $this->taskService->updateTaskStatus($task, $status);

            return $this->formatResponse(
                ['task' => $task->toArray()],
                "Статус задачи '{$task->title}' изменен на '{$status->name}'"
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

        if (isset($parameters['id'])) {
            $task = Task::find($parameters['id']);
            return $task && $this->taskService->canUserManageTask($user, $task);
        }

        return true;
    }
} 