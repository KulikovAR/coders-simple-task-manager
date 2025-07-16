<?php

namespace App\Services;

use App\Enums\TaskStatusType;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectService
{
    public function getUserProjects(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Project::where('owner_id', $user->id)
            ->orWhereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->withCount('tasks')
            ->withCount('members')
            ->with(['owner', 'members.user']);

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(12);
    }

    public function getUserProjectsList(User $user): Collection
    {
        return $user->projects()->orderBy('name')->get();
    }

    public function createProject(array $data, User $user): Project
    {
        $project = Project::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'owner_id' => $user->id,
            'docs' => $data['docs'] ?? [],
        ]);

        // Создаем стандартные статусы для проекта
        $this->createDefaultTaskStatuses($project);

        return $project->load(['owner', 'members.user']);
    }

    public function updateProject(Project $project, array $data): Project
    {
        $project->update([
            'name' => $data['name'] ?? $project->name,
            'description' => $data['description'] ?? $project->description,
            'docs' => $data['docs'] ?? $project->docs,
        ]);

        return $project->load(['owner', 'members.user']);
    }

    public function deleteProject(Project $project): bool
    {
        return $project->delete();
    }

    public function addMember(Project $project, User $user, string $role = 'member'): ProjectMember
    {
        return ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => $role,
        ]);
    }

    public function removeMember(Project $project, User $user): bool
    {
        return ProjectMember::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->delete();
    }

    public function canUserAccessProject(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id || 
               $project->members()->where('user_id', $user->id)->exists();
    }

    public function canUserManageProject(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id || 
               $project->members()->where('user_id', $user->id)
                   ->whereIn('role', ['owner', 'member'])->exists();
    }

    private function createDefaultTaskStatuses(Project $project): void
    {
        $defaultStatuses = TaskStatusType::getDefaultStatuses();

        foreach ($defaultStatuses as $status) {
            TaskStatus::create([
                'project_id' => $project->id,
                'name' => $status['name'],
                'order' => $status['order'],
                'color' => $status['color'],
            ]);
        }
    }
} 