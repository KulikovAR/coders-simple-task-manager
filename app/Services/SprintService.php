<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class SprintService
{
    public function getProjectSprints(Project $project): Collection
    {
        return $project->sprints()
            ->with(['tasks.assignee', 'tasks.reporter', 'tasks.status:id,name,color,project_id,sprint_id'])
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function createSprint(array $data, Project $project): Sprint
    {
        return Sprint::create([
            'project_id' => $project->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => $data['status'] ?? 'planned',
        ]);
    }

    public function updateSprint(Sprint $sprint, array $data): Sprint
    {
        $sprint->update([
            'name' => $data['name'] ?? $sprint->name,
            'description' => $data['description'] ?? $sprint->description,
            'start_date' => $data['start_date'] ?? $sprint->start_date,
            'end_date' => $data['end_date'] ?? $sprint->end_date,
            'status' => $data['status'] ?? $sprint->status,
        ]);

        return $sprint->load(['tasks.assignee', 'tasks.reporter', 'tasks.status:id,name,color,project_id,sprint_id']);
    }

    public function deleteSprint(Sprint $sprint): bool
    {
        // Убираем задачи из спринта перед удалением
        $sprint->tasks()->update(['sprint_id' => null]);
        
        return $sprint->delete();
    }

    public function canUserManageSprint(User $user, Sprint $sprint): bool
    {
        $projectService = app(ProjectService::class);
        return $projectService->canUserContributeToProject($user, $sprint->project);
    }
} 