<?php

namespace App\Services\Ai\Commands;

use App\Services\ProjectService;
use App\Models\User;

class CreateProjectCommand extends AbstractCommand
{
    private ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'CREATE_PROJECT';
    }

    public function getDescription(): string
    {
        return 'Создать новый проект';
    }

    public function getParametersSchema(): array
    {
        return [
            'name' => ['type' => 'string', 'required' => true, 'description' => 'Название проекта'],
            'description' => ['type' => 'string', 'required' => false, 'description' => 'Описание проекта'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Статус проекта (active, completed, on_hold, cancelled)'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['name']);

            $project = $this->projectService->createProject($parameters, $user);

            return $this->formatResponse(
                ['project' => $project->toArray()],
                "Проект '{$project->name}' успешно создан"
            );
        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }
} 