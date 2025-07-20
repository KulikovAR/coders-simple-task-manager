<?php

namespace App\Services\Ai\Commands;

use App\Services\ProjectService;
use App\Models\User;

class ListProjectsCommand extends AbstractCommand
{
    private ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'LIST_PROJECTS';
    }

    public function getDescription(): string
    {
        return 'Получить список проектов пользователя';
    }

    public function getParametersSchema(): array
    {
        return [
            'search' => ['type' => 'string', 'required' => false, 'description' => 'Поисковый запрос'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Фильтр по статусу'],
            'limit' => ['type' => 'integer', 'required' => false, 'description' => 'Количество проектов'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $filters = array_filter($parameters, fn($key) => in_array($key, ['search', 'status']), ARRAY_FILTER_USE_KEY);
            
            $projects = $this->projectService->getUserProjects($user, $filters);

            return $this->formatResponse(
                ['projects' => $projects->toArray()],
                "Найдено {$projects->total()} проектов"
            );
        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }
} 