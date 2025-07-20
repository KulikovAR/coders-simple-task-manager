<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Services\ProjectService;
use App\Models\User;

class ProjectContextProvider implements ContextProviderInterface
{
    private ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'projects';
    }

    public function getContext($user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        $projects = $this->projectService->getUserProjectsList($user);

        return [
            'projects' => $projects->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'status' => $project->status,
                    'tasks_count' => $project->tasks_count ?? 0,
                    'members_count' => $project->members_count ?? 0,
                ];
            })->toArray(),
            'projects_count' => $projects->count(),
        ];
    }
} 