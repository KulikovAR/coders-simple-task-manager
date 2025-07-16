<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskService
{
    public function getUserTasks(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Task::with(['project', 'sprint', 'status'])->withCount('comments')
            ->whereHas('project', function($q) use ($user) {
                $q->where('owner_id', $user->id)
                  ->orWhereHas('members', function($memberQuery) use ($user) {
                      $memberQuery->where('user_id', $user->id);
                  });
            });

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->whereHas('status', function($q) use ($filters) {
                $q->where('name', $filters['status']);
            });
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(12);
    }

    public function getProjectTasks(Project $project): Collection
    {
        return $project->tasks()
            ->with(['assignee', 'reporter', 'status', 'sprint'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createTask(array $data, Project $project, User $reporter): Task
    {
        // Получаем первый статус (To Do) как статус по умолчанию
        $defaultStatus = $project->taskStatuses()->orderBy('order')->first();

        return Task::create([
            'project_id' => $project->id,
            'sprint_id' => $data['sprint_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'result' => $data['result'] ?? null,
            'merge_request' => $data['merge_request'] ?? null,
            'assignee_id' => $data['assignee_id'] ?? null,
            'reporter_id' => $reporter->id,
            'priority' => $data['priority'] ?? 'medium',
            'status_id' => $defaultStatus->id,
        ]);
    }

    public function updateTask(Task $task, array $data): Task
    {
        $task->update([
            'sprint_id' => $data['sprint_id'] ?? $task->sprint_id,
            'title' => $data['title'] ?? $task->title,
            'description' => $data['description'] ?? $task->description,
            'result' => $data['result'] ?? $task->result,
            'merge_request' => $data['merge_request'] ?? $task->merge_request,
            'assignee_id' => $data['assignee_id'] ?? $task->assignee_id,
            'priority' => $data['priority'] ?? $task->priority,
        ]);

        return $task->load(['assignee', 'reporter', 'status', 'sprint']);
    }

    public function updateTaskStatus(Task $task, TaskStatus $status): Task
    {
        $task->update(['status_id' => $status->id]);
        return $task->load(['assignee', 'reporter', 'status', 'sprint']);
    }

    public function assignTask(Task $task, User $assignee): Task
    {
        $task->update(['assignee_id' => $assignee->id]);
        return $task->load(['assignee', 'reporter', 'status', 'sprint']);
    }

    public function deleteTask(Task $task): bool
    {
        return $task->delete();
    }

    public function getProjectBoard(Project $project): array
    {
        $statuses = $project->taskStatuses()
            ->with(['tasks' => function ($query) {
                $query->with(['assignee', 'reporter', 'sprint'])
                    ->orderBy('created_at', 'desc');
            }])
            ->orderBy('order')
            ->get();

        return $statuses->toArray();
    }

    public function canUserManageTask(User $user, Task $task): bool
    {
        $projectService = new ProjectService();
        return $projectService->canUserManageProject($user, $task->project);
    }

    public function canUserViewTask(User $user, Task $task): bool
    {
        $projectService = new ProjectService();
        return $projectService->canUserAccessProject($user, $task->project);
    }
} 