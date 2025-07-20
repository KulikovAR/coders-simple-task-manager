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
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Фильтр по статусу (к выполнению, в работе, готово, на проверке, отменено)'],
            'priority' => ['type' => 'string', 'required' => false, 'description' => 'Фильтр по приоритету (низкий, средний, высокий, срочный)'],
            'assignee_id' => ['type' => 'integer', 'required' => false, 'description' => 'Фильтр по исполнителю'],
            'my_tasks' => ['type' => 'boolean', 'required' => false, 'description' => 'Только мои задачи'],
            'search' => ['type' => 'string', 'required' => false, 'description' => 'Поисковый запрос'],
            'all_projects' => ['type' => 'boolean', 'required' => false, 'description' => 'Задачи из всех проектов'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $filters = array_filter($parameters, fn($key) => in_array($key, [
                'project_id', 'sprint_id', 'status', 'priority', 'assignee_id', 'my_tasks', 'search', 'all_projects'
            ]), ARRAY_FILTER_USE_KEY);
            
            // Обрабатываем статус - маппим русские названия на английские
            if (isset($filters['status'])) {
                $filters['status'] = $this->mapStatusToEnglish($filters['status']);
            }
            
            // Обрабатываем приоритет - маппим русские названия на английские
            if (isset($filters['priority'])) {
                $filters['priority'] = $this->mapPriorityToEnglish($filters['priority']);
            }
            
            $tasks = $this->taskService->getUserTasks($user, $filters);

            // Формируем ссылки
            $links = [
                'tasks' => route('tasks.index')
            ];

            // Если есть фильтр по проекту, добавляем ссылку на проект
            if (isset($filters['project_id'])) {
                $links['project'] = route('projects.show', $filters['project_id']);
            }

            // Если есть фильтр по спринту, добавляем ссылку на спринт
            if (isset($filters['sprint_id'])) {
                $links['sprint'] = route('sprints.show', $filters['sprint_id']);
            }

            return $this->formatResponse(
                ['tasks' => $tasks->toArray()],
                "Найдено {$tasks->total()} задач",
                $links
            );
        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    /**
     * Маппинг русских названий статусов на английские
     */
    private function mapStatusToEnglish(string $status): string
    {
        $statusMap = [
            'к выполнению' => 'To Do',
            'в работе' => 'In Progress',
            'готово' => 'Done',
            'на проверке' => 'Review',
            'отменено' => 'Cancelled',
            'выполнено' => 'Done',
            'завершено' => 'Done',
            'тестирование' => 'Testing',
            'в тестировании' => 'Testing',
        ];
        
        $status = mb_strtolower(trim($status));
        return $statusMap[$status] ?? $status;
    }

    /**
     * Маппинг русских названий приоритетов на английские
     */
    private function mapPriorityToEnglish(string $priority): string
    {
        $priorityMap = [
            'низкий' => 'low',
            'средний' => 'medium',
            'высокий' => 'high',
            'срочный' => 'urgent',
            'низкая' => 'low',
            'средняя' => 'medium',
            'высокая' => 'high',
            'срочная' => 'urgent',
        ];
        
        $priority = mb_strtolower(trim($priority));
        return $priorityMap[$priority] ?? $priority;
    }
} 