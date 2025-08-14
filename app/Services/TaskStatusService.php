<?php

namespace App\Services;

use App\Enums\TaskStatusType;
use App\Models\Project;
use App\Models\Sprint;
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
            // Удаляем старые кастомные статусы спринта
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

            // Удаляем статусы, которые больше не нужны
            $keepIds = $updatedStatuses->pluck('id')->filter();
            TaskStatus::where('project_id', $project->id)
                ->whereNull('sprint_id')
                ->whereNotIn('id', $keepIds)
                ->delete();

            return $updatedStatuses;
        });
    }

    /**
     * Удалить кастомные статусы спринта (вернуться к статусам проекта)
     */
    public function deleteSprintStatuses(Sprint $sprint): bool
    {
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
     * Проверить есть ли кастомные статусы у спринта
     */
    public function hasCustomStatuses(Sprint $sprint): bool
    {
        return TaskStatus::where('sprint_id', $sprint->id)->exists();
    }
}
