<?php

namespace App\Services;

use App\Enums\TaskStatusType;
use App\Exceptions\StatusHasTasksException;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskStatus;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TaskStatusService
{
    /**
     * Получить статусы для спринта с фоллбэком на статусы проекта
     */
    public function getSprintStatuses(Sprint $sprint): Collection
    {
        // Сначала ищем кастомные статусы спринта
        $sprintStatuses = TaskStatus::where('sprint_id', $sprint->id)
            ->orderBy('order')
            ->get();

        // Если кастомных статусов нет, возвращаем статусы проекта
        if ($sprintStatuses->isEmpty()) {
            return $this->getProjectStatuses($sprint->project);
        }

        return $sprintStatuses;
    }

    /**
     * Получить статусы проекта (дефолтные)
     */
    public function getProjectStatuses(Project $project): Collection
    {
        return TaskStatus::where('project_id', $project->id)
            ->whereNull('sprint_id')
            ->orderBy('order')
            ->get();
    }

    /**
     * Создать дефолтные статусы для проекта
     */
    public function createDefaultProjectStatuses(Project $project): void
    {
        $defaultStatuses = TaskStatusType::getDefaultStatuses();

        foreach ($defaultStatuses as $status) {
            TaskStatus::create([
                'project_id' => $project->id,
                'sprint_id' => null, // Это статусы проекта
                'name' => $status['name'],
                'order' => $status['order'],
                'color' => $status['color'],
                'is_custom' => false,
            ]);
        }
    }

    /**
     * Создать кастомные статусы для спринта на основе статусов проекта
     */
    public function createCustomSprintStatuses(Sprint $sprint): Collection
    {
        $projectStatuses = $this->getProjectStatuses($sprint->project);
        $customStatuses = new \Illuminate\Database\Eloquent\Collection();

        DB::transaction(function () use ($sprint, $projectStatuses, &$customStatuses) {
            foreach ($projectStatuses as $projectStatus) {
                $customStatus = TaskStatus::create([
                    'project_id' => $sprint->project_id,
                    'sprint_id' => $sprint->id,
                    'name' => $projectStatus->name,
                    'order' => $projectStatus->order,
                    'color' => $projectStatus->color,
                    'is_custom' => true,
                ]);
                $customStatuses->push($customStatus);
            }
        });

        return $customStatuses;
    }

    /**
     * Обновить статусы спринта
     */
    public function updateSprintStatuses(Sprint $sprint, array $statusesData): Collection
    {
        return DB::transaction(function () use ($sprint, $statusesData) {
            // Проверяем старые статусы спринта перед удалением
            $oldStatuses = TaskStatus::where('sprint_id', $sprint->id)->get();
            $statusesWithTasks = [];
            
            foreach ($oldStatuses as $status) {
                if (!$this->canDeleteStatus($status)) {
                    $statusesWithTasks[] = $status->name;
                }
            }

            // Если есть статусы с задачами, выбрасываем исключение
            if (!empty($statusesWithTasks)) {
                throw new StatusHasTasksException($statusesWithTasks);
            }

            // Удаляем старые кастомные статусы спринта только если в них нет задач
            TaskStatus::where('sprint_id', $sprint->id)->delete();

            $updatedStatuses = new \Illuminate\Database\Eloquent\Collection();

            foreach ($statusesData as $index => $statusData) {
                $status = TaskStatus::create([
                    'project_id' => $sprint->project_id,
                    'sprint_id' => $sprint->id,
                    'name' => $statusData['name'],
                    'order' => $index + 1,
                    'color' => $statusData['color'],
                    'is_custom' => true,
                ]);
                $updatedStatuses->push($status);
            }

            return $updatedStatuses;
        });
    }

    /**
     * Обновить статусы проекта (дефолтные)
     */
    public function updateProjectStatuses(Project $project, array $statusesData): Collection
    {
        return DB::transaction(function () use ($project, $statusesData) {
            $projectStatuses = $this->getProjectStatuses($project);
            $updatedStatuses = new \Illuminate\Database\Eloquent\Collection();

            foreach ($statusesData as $index => $statusData) {
                $statusId = $statusData['id'] ?? null;
                
                if ($statusId && $status = $projectStatuses->find($statusId)) {
                    // Обновляем существующий статус
                    $status->update([
                        'name' => $statusData['name'],
                        'order' => $index + 1,
                        'color' => $statusData['color'],
                    ]);
                } else {
                    // Создаем новый статус
                    $status = TaskStatus::create([
                        'project_id' => $project->id,
                        'sprint_id' => null,
                        'name' => $statusData['name'],
                        'order' => $index + 1,
                        'color' => $statusData['color'],
                        'is_custom' => false,
                    ]);
                }
                $updatedStatuses->push($status);
            }

            // Проверяем статусы, которые нужно удалить
            $keepIds = $updatedStatuses->pluck('id')->filter();
            $statusesToDelete = TaskStatus::where('project_id', $project->id)
                ->whereNull('sprint_id')
                ->whereNotIn('id', $keepIds)
                ->get();

            // Проверяем, есть ли задачи в статусах, которые планируется удалить
            $statusesWithTasks = [];
            foreach ($statusesToDelete as $status) {
                if (!$this->canDeleteStatus($status)) {
                    $statusesWithTasks[] = $status->name;
                }
            }

            // Если есть статусы с задачами, выбрасываем исключение
            if (!empty($statusesWithTasks)) {
                throw new StatusHasTasksException($statusesWithTasks);
            }

            // Удаляем статусы только если в них нет задач
            foreach ($statusesToDelete as $status) {
                $status->delete();
            }

            return $updatedStatuses;
        });
    }

    /**
     * Удалить кастомные статусы спринта (вернуться к статусам проекта)
     */
    public function deleteSprintStatuses(Sprint $sprint): bool
    {
        // Проверяем статусы спринта перед удалением
        $sprintStatuses = TaskStatus::where('sprint_id', $sprint->id)->get();
        $statusesWithTasks = [];
        
        foreach ($sprintStatuses as $status) {
            if (!$this->canDeleteStatus($status)) {
                $statusesWithTasks[] = $status->name;
            }
        }

        // Если есть статусы с задачами, выбрасываем исключение
        if (!empty($statusesWithTasks)) {
            throw new StatusHasTasksException($statusesWithTasks);
        }

        return TaskStatus::where('sprint_id', $sprint->id)->delete();
    }

    /**
     * Проверить можно ли удалить статус (нет ли задач с этим статусом)
     */
    public function canDeleteStatus(TaskStatus $status): bool
    {
        return $status->tasks()->count() === 0;
    }

    /**
     * Получить статусы для задач спринта или проекта
     */
    public function getRelevantStatuses(Project $project, ?Sprint $sprint = null): Collection
    {
        if ($sprint) {
            return $this->getSprintStatuses($sprint);
        }

        return $this->getProjectStatuses($project);
    }

    /**
     * Получить статусы с учетом полного контекста (проект, спринт, задача)
     */
    public function getContextualStatuses(Project $project, ?Sprint $sprint = null, ?Task $task = null): Collection
    {
        // Если передана задача, приоритет контексту задачи
        if ($task) {
            // Если у задачи есть спринт, используем его
            if ($task->sprint_id && $task->sprint) {
                return $this->getSprintStatuses($task->sprint);
            }
            
            // Если у задачи нет спринта, используем статусы проекта
            return $this->getProjectStatuses($task->project ?? $project);
        }

        // Если спринт передан явно, используем его статусы
        if ($sprint) {
            return $this->getSprintStatuses($sprint);
        }

        // По умолчанию используем статусы проекта
        return $this->getProjectStatuses($project);
    }

    /**
     * Проверить принадлежит ли статус указанному контексту
     */
    public function isStatusValidForContext(TaskStatus $status, Project $project, ?Sprint $sprint = null): bool
    {
        // Статус должен принадлежать проекту
        if ($status->project_id !== $project->id) {
            return false;
        }

        // Если контекст - спринт
        if ($sprint) {
            // Статус должен принадлежать либо спринту, либо проекту (если у спринта нет кастомных статусов)
            $hasCustomStatuses = $this->hasCustomStatuses($sprint);
            
            if ($hasCustomStatuses) {
                // У спринта есть кастомные статусы - статус должен принадлежать спринту
                return $status->sprint_id === $sprint->id;
            } else {
                // У спринта нет кастомных статусов - статус должен принадлежать проекту
                return $status->sprint_id === null;
            }
        }

        // Контекст - проект, статус должен принадлежать проекту (не спринту)
        return $status->sprint_id === null;
    }

    /**
     * Получить доступные статусы для конкретной задачи
     */
    public function getAvailableStatusesForTask(?Task $task, Project $project, ?Sprint $sprint = null): Collection
    {
        return $this->getContextualStatuses($project, $sprint, $task);
    }

    /**
     * Проверить есть ли кастомные статусы у спринта
     */
    public function hasCustomStatuses(Sprint $sprint): bool
    {
        return TaskStatus::where('sprint_id', $sprint->id)->exists();
    }

    /**
     * Получить статистику по статусам в контексте
     */
    public function getStatusStats(Project $project, ?Sprint $sprint = null): array
    {
        $statuses = $this->getContextualStatuses($project, $sprint);
        $stats = [];

        foreach ($statuses as $status) {
            $taskCount = $status->tasks()
                ->when($sprint, function ($query) use ($sprint) {
                    return $query->where('sprint_id', $sprint->id);
                })
                ->when(!$sprint, function ($query) use ($project) {
                    return $query->where('project_id', $project->id)->whereNull('sprint_id');
                })
                ->count();

            $stats[] = [
                'status' => $status,
                'task_count' => $taskCount,
            ];
        }

        return $stats;
    }
}
