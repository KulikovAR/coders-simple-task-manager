<?php

namespace App\Services\Ai\Commands;

use App\Services\TaskService;
use App\Models\Task;
use App\Models\User;

class UpdateTaskCommand extends AbstractCommand
{
    private TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function getName(): string
    {
        return 'UPDATE_TASK';
    }

    public function getDescription(): string
    {
        return 'Обновить существующую задачу';
    }

    public function getParametersSchema(): array
    {
        return [
            'id' => ['type' => 'integer', 'required' => true, 'description' => 'ID задачи'],
            'title' => ['type' => 'string', 'required' => false, 'description' => 'Новое название задачи'],
            'description' => ['type' => 'string', 'required' => false, 'description' => 'Новое описание задачи'],
            'assignee_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID нового исполнителя'],
            'priority' => ['type' => 'string', 'required' => false, 'description' => 'Новый приоритет'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Новый статус'],
            'result' => ['type' => 'string', 'required' => false, 'description' => 'Результат выполнения'],
            'merge_request' => ['type' => 'string', 'required' => false, 'description' => 'Ссылка на merge request'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['id']);

            $task = Task::with(['project', 'status'])->findOrFail($parameters['id']);
            
            if (!$this->taskService->canUserManageTask($user, $task)) {
                throw new \Exception('У вас нет прав для редактирования этой задачи');
            }

            $task = $this->taskService->updateTask($task, $parameters);

            return $this->formatResponse(
                ['task' => $task->toArray()],
                "Задача '{$task->title}' успешно обновлена"
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