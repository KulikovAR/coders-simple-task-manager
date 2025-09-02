<?php

namespace App\Services;


use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use App\Services\HtmlContentService;
use App\Helpers\TagHelper;
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
            $query->whereHas('status', function($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['status'] . '%');
            });
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

        // Фильтрация по тегам
        if (!empty($filters['tags'])) {
            $tags = TagHelper::normalize($filters['tags']);
            if (!empty($tags)) {
                $query->where(function($q) use ($tags) {
                    foreach ($tags as $tag) {
                        $q->orWhereJsonContains('tags', $tag);
                    }
                });
            }
        }

        return $query->with(['assignee', 'reporter', 'status:id,name,color,project_id,sprint_id', 'sprint', 'project'])
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();
    }

    public function getProjectTasks(Project $project): Collection
    {
        return $project->tasks()
            ->with(['assignee', 'reporter', 'status:id,name,color,project_id,sprint_id', 'sprint', 'project'])
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

        // Обрабатываем HTML контент с изображениями
        $htmlContentService = app(HtmlContentService::class);

        $processedDescription = null;
        if (!empty($data['description'])) {
            $processedDescription = $htmlContentService->processContent($data['description'], [
                'storage_path' => 'tasks/' . $project->id . '/descriptions',
                'disk' => 'public'
            ]);
        }

        $processedResult = null;
        if (!empty($data['result'])) {
            $processedResult = $htmlContentService->processContent($data['result'], [
                'storage_path' => 'tasks/' . $project->id . '/results',
                'disk' => 'public'
            ]);
        }

        $task = Task::create([
            'project_id' => $project->id,
            'sprint_id' => $data['sprint_id'] ?? null,
            'title' => $data['title'],
            'description' => $processedDescription ? $processedDescription['html'] : null,
            'result' => $processedResult ? $processedResult['html'] : null,
            'merge_request' => $data['merge_request'] ?? null,
            'assignee_id' => $data['assignee_id'] ?? null,
            'reporter_id' => $reporter->id,
            'priority' => $data['priority'] ?? 'medium',
            'status_id' => $statusId,
            'deadline' => isset($data['deadline']) ? $data['deadline'] : null,
            'tags' => isset($data['tags']) ? TagHelper::normalize($data['tags']) : null,
        ]);

        return $task->load(['assignee', 'reporter', 'status:id,name,color,project_id,sprint_id', 'sprint', 'project']);
    }

    public function updateTask(Task $task, array $data): Task
    {
        $htmlContentService = app(HtmlContentService::class);

        $processedDescription = null;
        if (isset($data['description'])) {
            if (!empty($data['description'])) {
                $processedDescription = $htmlContentService->updateContent(
                    $data['description'],
                    $task->description ?? '',
                    [
                        'storage_path' => 'tasks/' . $task->project_id . '/descriptions',
                        'disk' => 'public'
                    ]
                );

                $htmlContentService->cleanupUnusedImages(
                    $task->description ?? '',
                    $processedDescription['html'],
                    ['disk' => 'public']
                );
            } else {
                $htmlContentService->cleanupUnusedImages(
                    $task->description ?? '',
                    '',
                    ['disk' => 'public']
                );
            }
        }

        $processedResult = null;
        if (isset($data['result'])) {
            if (!empty($data['result'])) {
                $processedResult = $htmlContentService->updateContent(
                    $data['result'],
                    $task->result ?? '',
                    [
                        'storage_path' => 'tasks/' . $task->project_id . '/results',
                        'disk' => 'public'
                    ]
                );

                $htmlContentService->cleanupUnusedImages(
                    $task->result ?? '',
                    $processedResult['html'],
                    ['disk' => 'public']
                );
            } else {
                $htmlContentService->cleanupUnusedImages(
                    $task->result ?? '',
                    '',
                    ['disk' => 'public']
                );
            }
        }

        $updateData = [
            'sprint_id' => array_key_exists('sprint_id', $data) ? ($data['sprint_id'] ?: null) : $task->sprint_id,
            'title' => $data['title'] ?? $task->title,
            'description' => $processedDescription ? $processedDescription['html'] : ($data['description'] ?? $task->description),
            'result' => $processedResult ? $processedResult['html'] : ($data['result'] ?? $task->result),
            'merge_request' => $data['merge_request'] ?? $task->merge_request,
            'assignee_id' => array_key_exists('assignee_id', $data) ? ($data['assignee_id'] ?: null) : $task->assignee_id,
            'priority' => $data['priority'] ?? $task->priority,
            'tags' => array_key_exists('tags', $data) ? TagHelper::normalize($data['tags']) : $task->tags,
        ];

        if (array_key_exists('deadline', $data)) {
            $updateData['deadline'] = !empty($data['deadline']) ? $data['deadline'] : null;
        } else {
            $updateData['deadline'] = $task->deadline;
        }

        // Проверяем, изменился ли спринт
        $sprintChanged = array_key_exists('sprint_id', $data) && $data['sprint_id'] != $task->sprint_id;
        $newSprintId = array_key_exists('sprint_id', $data) ? ($data['sprint_id'] ?: null) : $task->sprint_id;

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
        } elseif ($sprintChanged) {
            // Если спринт изменился, но статус не указан, присваиваем первый статус нового спринта
            $firstStatusId = $this->getFirstStatusForSprintChange($task, $newSprintId);
            if ($firstStatusId) {
                $updateData['status_id'] = $firstStatusId;
            }
        }

        $task->update($updateData);

        return $task->load(['assignee', 'reporter', 'status:id,name,color,project_id,sprint_id', 'sprint', 'project']);
    }

    public function updateTaskStatus(Task $task, TaskStatus $status): Task
    {
        $task->update(['status_id' => $status->id]);
        return $task->load(['assignee', 'reporter', 'status:id,name,color,project_id,sprint_id', 'sprint', 'project']);
    }

    public function updateTaskPriority(Task $task, string $priority): Task
    {
        $task->update(['priority' => $priority]);
        return $task->load(['assignee', 'reporter', 'status:id,name,color,project_id,sprint_id', 'sprint', 'project']);
    }

    public function assignTask(Task $task, User $assignee): Task
    {
        $task->update(['assignee_id' => $assignee->id]);
        return $task->load(['assignee', 'reporter', 'status:id,name,color,project_id,sprint_id', 'sprint', 'project']);
    }

    public function deleteTask(Task $task): bool
    {
        return $task->delete();
    }

    public function getProjectBoard(Project $project): array
    {
        $statuses = $project->taskStatuses()
            ->with(['tasks' => function ($query) {
                $query->with(['assignee', 'reporter', 'sprint', 'project', 'status:id,name,color,project_id,sprint_id'])
                    ->orderBy('created_at', 'desc');
            }])
            ->orderBy('order')
            ->get();

        return $statuses->toArray();
    }

    public function canUserManageTask(User $user, Task $task): bool
    {
        $projectService = app(ProjectService::class);
        return $projectService->canUserContributeToProject($user, $task->project);
    }

    public function canUserViewTask(User $user, Task $task): bool
    {
        $projectService = app(ProjectService::class);
        return $projectService->canUserAccessProject($user, $task->project);
    }

    /**
     * Получить первый статус для задачи при смене спринта
     */
    public function getFirstStatusForSprintChange(Task $task, ?int $newSprintId): ?int
    {
        $taskStatusService = app(TaskStatusService::class);
        
        if ($newSprintId) {
            // Задача перемещается в спринт - используем статусы спринта
            $sprint = \App\Models\Sprint::find($newSprintId);
            if ($sprint) {
                $firstStatus = $taskStatusService->getFirstStatusForContext($task->project, $sprint);
                return $firstStatus?->id;
            }
        } else {
            // Задача перемещается из спринта в проект - используем статусы проекта
            $firstStatus = $taskStatusService->getFirstStatusForContext($task->project);
            return $firstStatus?->id;
        }
        
        return null;
    }
}
