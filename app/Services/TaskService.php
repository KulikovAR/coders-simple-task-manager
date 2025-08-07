<?php

namespace App\Services;

use App\Helpers\TaskStatusHelper;
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
        $query = Task::with(['project', 'sprint', 'status', 'assignee', 'reporter'])->withCount('comments')
            ->whereHas('project', function($q) use ($user) {
                $q->where('owner_id', $user->id)
                  ->orWhereHas('members', function($memberQuery) use ($user) {
                      $memberQuery->where('user_id', $user->id);
                  });
            });

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('id', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $searchStatus = $filters['status'];
            $statusMapping = TaskStatusHelper::getStatusMapping();
            
            // Если ищем русское название, добавляем поиск по английскому
            if (isset($statusMapping[$searchStatus])) {
                $query->whereHas('status', function($q) use ($searchStatus, $statusMapping) {
                    $q->where('name', $searchStatus)
                      ->orWhere('name', $statusMapping[$searchStatus]);
                });
            } else {
                $query->whereHas('status', function($q) use ($filters) {
                    $q->where('name', 'like', '%' . $filters['status'] . '%');
                });
            }
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (!empty($filters['sprint_id'])) {
            $query->where('sprint_id', $filters['sprint_id']);
        }

        if (!empty($filters['assignee_id'])) {
            $query->where('assignee_id', $filters['assignee_id']);
        }

        if (!empty($filters['reporter_id'])) {
            $query->where('reporter_id', $filters['reporter_id']);
        }

        // Фильтр "мои задачи"
        if (!empty($filters['my_tasks']) && ($filters['my_tasks'] === true || $filters['my_tasks'] === '1')) {
            $query->where('assignee_id', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->paginate(12)->withQueryString();
    }

    public function getProjectTasks(Project $project): Collection
    {
        return $project->tasks()
            ->with(['assignee', 'reporter', 'status', 'sprint', 'project'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createTask(array $data, Project $project, User $reporter): Task
    {
        // Определяем статус задачи
        $statusId = null;
        
        // Сначала проверяем, передан ли status_id напрямую
        if (isset($data['status_id']) && $data['status_id']) {
            $statusId = $data['status_id'];
        }
        // Потом проверяем, передано ли название статуса
        elseif (isset($data['status']) && $data['status']) {
            $status = $project->taskStatuses()->where('name', $data['status'])->first();
            if ($status) {
                $statusId = $status->id;
            }
        }
        
        // Если статус не найден, берем первый статус проекта как статус по умолчанию
        if (!$statusId) {
            $defaultStatus = $project->taskStatuses()->orderBy('order')->first();
            $statusId = $defaultStatus ? $defaultStatus->id : null;
        }

        $task = Task::create([
            'project_id' => $project->id,
            'sprint_id' => $data['sprint_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'result' => $data['result'] ?? null,
            'merge_request' => $data['merge_request'] ?? null,
            'assignee_id' => $data['assignee_id'] ?? null,
            'reporter_id' => $reporter->id,
            'priority' => $data['priority'] ?? 'medium',
            'status_id' => $statusId,
        ]);

        return $task->load(['assignee', 'reporter', 'status', 'sprint', 'project']);
    }

    public function updateTask(Task $task, array $data): Task
    {
        $updateData = [
            'sprint_id' => $data['sprint_id'] ?? $task->sprint_id,
            'title' => $data['title'] ?? $task->title,
            'description' => $data['description'] ?? $task->description,
            'result' => $data['result'] ?? $task->result,
            'merge_request' => $data['merge_request'] ?? $task->merge_request,
            'assignee_id' => $data['assignee_id'] ?? $task->assignee_id,
            'priority' => $data['priority'] ?? $task->priority,
        ];

        // Обновляем статус, если он передан
        if (isset($data['status_id']) && $data['status_id']) {
            // Проверяем, что status_id принадлежит проекту задачи
            $status = $task->project->taskStatuses()->where('id', $data['status_id'])->first();
            if ($status) {
                $updateData['status_id'] = $data['status_id'];
            }
        } elseif (isset($data['status']) && $data['status']) {
            // Ищем статус по названию
            $status = $task->project->taskStatuses()->where('name', $data['status'])->first();
            if ($status) {
                $updateData['status_id'] = $status->id;
            }
        }

        $task->update($updateData);

        return $task->load(['assignee', 'reporter', 'status', 'sprint', 'project']);
    }

    public function updateTaskStatus(Task $task, TaskStatus $status): Task
    {
        $task->update(['status_id' => $status->id]);
        return $task->load(['assignee', 'reporter', 'status', 'sprint', 'project']);
    }

    public function updateTaskPriority(Task $task, string $priority): Task
    {
        $task->update(['priority' => $priority]);
        return $task->load(['assignee', 'reporter', 'status', 'sprint', 'project']);
    }

    public function assignTask(Task $task, User $assignee): Task
    {
        $task->update(['assignee_id' => $assignee->id]);
        return $task->load(['assignee', 'reporter', 'status', 'sprint', 'project']);
    }

    public function deleteTask(Task $task): bool
    {
        return $task->delete();
    }

    public function getProjectBoard(Project $project): array
    {
        $statuses = $project->taskStatuses()
            ->with(['tasks' => function ($query) {
                $query->with(['assignee', 'reporter', 'sprint', 'project', 'status'])
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