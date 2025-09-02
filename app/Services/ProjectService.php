<?php

namespace App\Services;

use App\Enums\TaskStatusType;
use App\Helpers\SlugHelper;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TaskStatus;
use App\Models\User;
use App\Services\TaskStatusService;
use App\Services\HtmlContentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectService
{
    public function __construct(
        private TaskStatusService $taskStatusService,
        private HtmlContentService $htmlContentService
    ) {}
    public function getUserProjects(User $user, array $filters = []): LengthAwarePaginator
    {
        // Группируем условие принадлежности проекту, чтобы фильтры применялись ко всем найденным проектам
        $query = Project::query()
            ->where(function ($q) use ($user) {
                $q->where('owner_id', $user->id)
                  ->orWhereHas('members', function ($q2) use ($user) {
                      $q2->where('user_id', $user->id);
                  });
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

        // Сохраняем параметры запроса в ссылках пагинации
        // По умолчанию активные проекты первыми
        $query->orderByRaw("CASE WHEN status = 'active' THEN 0 ELSE 1 END");
        return $query->orderBy('created_at', 'desc')->paginate(12)->withQueryString();
    }

    public function getUserProjectsList(User $user): Collection
    {
        return Project::where('owner_id', $user->id)
            ->orWhereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderBy('name')
            ->get();
    }

    public function createProject(array $data, User $user): Project
    {
        // Обрабатываем HTML контент с изображениями
        $processedDescription = null;
        if (!empty($data['description'])) {
            $processedDescription = $this->htmlContentService->processContent($data['description'], [
                'storage_path' => 'projects/' . ($user->id ?? 'temp') . '/descriptions',
                'disk' => 'public'
            ]);
        }

        $project = Project::create([
            'name' => $data['name'],
            'slug' => SlugHelper::generateUniqueSlug($data['name'], Project::class),
            'description' => $processedDescription['html'] ?? $data['description'] ?? null,
            'owner_id' => $user->id,
            'status' => $data['status'] ?? 'active',
            'deadline' => $data['deadline'] ?? null,
            'docs' => $data['docs'] ?? [],
        ]);

        $this->taskStatusService->createDefaultProjectStatuses($project);

        return $project->load(['owner', 'members.user']);
    }

    public function updateProject(Project $project, array $data): Project
    {
        $processedDescription = null;
        if (isset($data['description']) && $data['description'] !== $project->description) {
            $processedDescription = $this->htmlContentService->processContent($data['description'], [
                'storage_path' => 'projects/' . $project->id . '/descriptions',
                'disk' => 'public'
            ]);
        }

        $updateData = [
            'name' => $data['name'] ?? $project->name,
            'description' => $processedDescription['html'] ?? $data['description'] ?? $project->description,
            'status' => $data['status'] ?? $project->status,
            'deadline' => $data['deadline'] ?? $project->deadline,
            'docs' => $data['docs'] ?? $project->docs,
        ];

        // Обновляем slug только если изменилось название
        if (isset($data['name']) && $data['name'] !== $project->name) {
            $updateData['slug'] = SlugHelper::generateUniqueSlug($data['name'], Project::class, $project->id);
        }

        $project->update($updateData);

        return $project->load(['owner', 'members.user']);
    }

    public function deleteProject(Project $project): bool
    {
        return DB::transaction(function () use ($project) {
            $project->tasks()->delete();

            return $project->delete();
        });
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
                ->whereIn('role', ['member'])->exists();
    }

    public function canUserContributeToProject(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id ||
               $project->members()->where('user_id', $user->id)
                   ->whereIn('role', ['member'])->exists();
    }


}
