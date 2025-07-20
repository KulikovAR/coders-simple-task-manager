<?php

namespace App\Services\Ai\Commands;

use App\Services\ProjectService;
use App\Models\Project;
use App\Models\User;

class UpdateProjectCommand extends AbstractCommand
{
    private ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'UPDATE_PROJECT';
    }

    public function getDescription(): string
    {
        return 'Обновить существующий проект';
    }

    public function getParametersSchema(): array
    {
        return [
            'id' => ['type' => 'integer', 'required' => true, 'description' => 'ID проекта'],
            'name' => ['type' => 'string', 'required' => false, 'description' => 'Новое название проекта'],
            'description' => ['type' => 'string', 'required' => false, 'description' => 'Новое описание проекта'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Новый статус проекта'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['id']);

            $project = Project::findOrFail($parameters['id']);
            
            if (!$this->projectService->canUserManageProject($user, $project)) {
                throw new \Exception('У вас нет прав для редактирования этого проекта');
            }

            $project = $this->projectService->updateProject($project, $parameters);

            return $this->formatResponse(
                ['project' => $project->toArray()],
                "Проект '{$project->name}' успешно обновлен"
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
            $project = Project::find($parameters['id']);
            return $project && $this->projectService->canUserManageProject($user, $project);
        }

        return true;
    }
} 