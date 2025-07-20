<?php

namespace App\Services\Ai\Commands;

use App\Services\TaskService;
use App\Models\User;

class ListTasksCommand extends AbstractCommand
{
    private TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function getName(): string
    {
        return 'LIST_TASKS';
    }

    public function getDescription(): string
    {
        return 'Получить список задач пользователя';
    }

    public function getParametersSchema(): array
    {
        return [
            'project_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID проекта для фильтрации'],
            'sprint_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID спринта для фильтрации'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Фильтр по статусу'],
            'priority' => ['type' => 'string', 'required' => false, 'description' => 'Фильтр по приоритету'],
            'assignee_id' => ['type' => 'integer', 'required' => false, 'description' => 'Фильтр по исполнителю'],
            'my_tasks' => ['type' => 'boolean', 'required' => false, 'description' => 'Только мои задачи'],
            'search' => ['type' => 'string', 'required' => false, 'description' => 'Поисковый запрос'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $filters = array_filter($parameters, fn($key) => in_array($key, [
                'project_id', 'sprint_id', 'status', 'priority', 'assignee_id', 'my_tasks', 'search'
            ]), ARRAY_FILTER_USE_KEY);
            
            $tasks = $this->taskService->getUserTasks($user, $filters);

            return $this->formatResponse(
                ['tasks' => $tasks->toArray()],
                "Найдено {$tasks->total()} задач"
            );
        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }
} 