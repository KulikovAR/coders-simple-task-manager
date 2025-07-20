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

        $projectsArray = $projects->map(function ($project) use ($user) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'tasks_count' => $project->tasks_count ?? 0,
                'members_count' => $project->members_count ?? 0,
                'owner_id' => $project->owner_id,
                'can_manage' => $project->owner_id === $user->id,
            ];
        })->toArray();

        return [
            'projects' => $projectsArray,
            'projects_count' => $projects->count(),
            'project_names' => $projects->pluck('name')->toArray(),
            'available_statuses' => [
                'к выполнению' => 'To Do',
                'в работе' => 'In Progress',
                'готово' => 'Done',
                'на проверке' => 'Review',
                'отменено' => 'Cancelled',
                'тестирование' => 'Testing',
            ],
            'available_priorities' => [
                'низкий' => 'low',
                'средний' => 'medium',
                'высокий' => 'high',
                'срочный' => 'urgent',
            ],
            'user_permissions' => [
                'can_create_tasks' => true, // Пока что разрешаем всем
                'can_edit_projects' => $projects->where('owner_id', $user->id)->count() > 0,
                'can_delete_projects' => $projects->where('owner_id', $user->id)->count() > 0,
            ],
        ];
    }
} 