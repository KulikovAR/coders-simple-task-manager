<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskDependency;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GanttService
{
    /**
     * Получить данные для Гантт диаграммы проекта
     */
    public function getProjectGanttData(Project $project, ?int $sprintId = null): array
    {
        $query = $project->tasks()
            ->with(['assignee', 'status', 'dependencies.dependsOnTask'])
            ->orderBy('sort_order')
            ->orderBy('start_date');

        if ($sprintId) {
            $query->where('sprint_id', $sprintId);
        }

        $tasks = $query->get();

        return [
            'tasks' => $this->formatTasksForGantt($tasks),
            'dependencies' => $this->getDependenciesData($tasks),
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'start_date' => $this->getProjectStartDate($tasks),
                'end_date' => $this->getProjectEndDate($tasks),
            ]
        ];
    }

    /**
     * Форматировать задачи для Гантт диаграммы
     */
    private function formatTasksForGantt(Collection $tasks): array
    {
        return $tasks->map(function (Task $task) {
            return [
                'id' => $task->id,
                'code' => $task->code,
                'title' => $task->title,
                'start_date' => $task->start_date ? Carbon::parse($task->start_date)->format('Y-m-d') : null,
                'end_date' => $task->end_date, // Уже строка из accessor
                'duration_days' => $task->duration_days ?? 1,
                'progress_percent' => $task->progress_percent ?? 0,
                'is_milestone' => $task->isMilestone(),
                'assignee' => $task->assignee ? [
                    'id' => $task->assignee->id,
                    'name' => $task->assignee->name,
                ] : null,
                'status' => $task->status ? [
                    'id' => $task->status->id,
                    'name' => $task->status->name,
                    'color' => $task->status->color,
                ] : null,
                'priority' => $task->priority,
                'sort_order' => $task->sort_order ?? 0,
            ];
        })->toArray();
    }

    /**
     * Получить данные зависимостей
     */
    private function getDependenciesData(Collection $tasks): array
    {
        $dependencies = [];
        
        foreach ($tasks as $task) {
            foreach ($task->dependencies as $dependency) {
                $dependencies[] = [
                    'id' => $dependency->id,
                    'depends_on_task_id' => $dependency->depends_on_task_id,
                    'task_id' => $dependency->task_id,
                    'type' => $dependency->type,
                    'lag_days' => $dependency->lag_days,
                ];
            }
        }

        return $dependencies;
    }

    /**
     * Получить дату начала проекта
     */
    private function getProjectStartDate(Collection $tasks): ?string
    {
        $startDates = $tasks->pluck('start_date')->filter()->sort();
        return $startDates->first()?->format('Y-m-d');
    }

    /**
     * Получить дату окончания проекта
     */
    private function getProjectEndDate(Collection $tasks): ?string
    {
        $endDates = $tasks->map(function (Task $task) {
            return $task->getEndDateAttribute();
        })->filter()->sort();

        return $endDates->last();
    }

    /**
     * Обновить задачу в Гантт диаграмме
     */
    public function updateTaskGanttData(Task $task, array $data): Task
    {
        $allowedFields = [
            'start_date',
            'duration_days',
            'progress_percent',
            'is_milestone',
            'sort_order'
        ];

        $updateData = array_intersect_key($data, array_flip($allowedFields));
        
        // Валидация данных
        if (isset($updateData['start_date'])) {
            $updateData['start_date'] = Carbon::parse($updateData['start_date'])->format('Y-m-d');
        }

        if (isset($updateData['duration_days']) && $updateData['duration_days'] < 0) {
            $updateData['duration_days'] = 1;
        }

        if (isset($updateData['progress_percent'])) {
            $updateData['progress_percent'] = max(0, min(100, $updateData['progress_percent']));
        }

        $task->update($updateData);
        
        // Пересчитываем даты зависимых задач
        $this->recalculateDependentTasks($task);
        
        return $task->fresh();
    }

    /**
     * Пересчитать даты зависимых задач
     */
    private function recalculateDependentTasks(Task $task): void
    {
        // Получаем все задачи, которые зависят от этой задачи
        $dependentTasks = Task::whereHas('dependencies', function ($query) use ($task) {
            $query->where('depends_on_task_id', $task->id);
        })->get();

        if ($dependentTasks->isNotEmpty()) {
            $this->calculateTaskDates($task->project);
        }
    }

    /**
     * Получить зависимости проекта
     */
    public function getProjectDependencies(Project $project): array
    {
        $tasks = $project->tasks()->with(['dependencies', 'dependents'])->get();
        return $this->getDependenciesData($tasks);
    }

    /**
     * Создать зависимость между задачами
     */
    public function createDependency(int $taskId, int $dependsOnTaskId, string $type = 'finish_to_start', int $lagDays = 0): TaskDependency
    {
        // Проверяем, что задачи не одинаковые
        if ($taskId === $dependsOnTaskId) {
            throw new \Exception('Задача не может зависеть от самой себя');
        }

        // Проверяем, что связь уже не существует
        $existingDependency = TaskDependency::where('task_id', $taskId)
            ->where('depends_on_task_id', $dependsOnTaskId)
            ->first();

        if ($existingDependency) {
            $task = Task::find($taskId);
            $dependsOnTask = Task::find($dependsOnTaskId);
            throw new \Exception("Связь между задачами '{$dependsOnTask->code}' и '{$task->code}' уже существует");
        }

        // Проверяем, что не создаем циклическую зависимость
        if ($this->wouldCreateCycle($taskId, $dependsOnTaskId)) {
            throw new \Exception('Создание этой зависимости приведет к циклической зависимости');
        }

        return TaskDependency::create([
            'task_id' => $taskId,
            'depends_on_task_id' => $dependsOnTaskId,
            'type' => $type,
            'lag_days' => $lagDays,
        ]);
    }

    /**
     * Удалить зависимость
     */
    public function deleteDependency(int $dependencyId): bool
    {
        return TaskDependency::find($dependencyId)?->delete() ?? false;
    }

    /**
     * Проверить, создаст ли зависимость циклическую связь
     */
    private function wouldCreateCycle(int $taskId, int $dependsOnTaskId): bool
    {
        if ($taskId === $dependsOnTaskId) {
            return true;
        }

        // Проверяем, не зависит ли уже dependsOnTaskId от taskId
        $existingDependency = TaskDependency::where('task_id', $dependsOnTaskId)
            ->where('depends_on_task_id', $taskId)
            ->exists();

        if ($existingDependency) {
            return true;
        }

        // Рекурсивно проверяем все зависимости dependsOnTaskId
        $dependencies = TaskDependency::where('task_id', $dependsOnTaskId)->pluck('depends_on_task_id');
        
        foreach ($dependencies as $dependencyId) {
            if ($this->wouldCreateCycle($taskId, $dependencyId)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Автоматически рассчитать даты начала задач на основе зависимостей
     */
    public function calculateTaskDates(Project $project): void
    {
        $tasks = $project->tasks()->with('dependencies.dependsOnTask')->get();
        $calculated = [];

        foreach ($tasks as $task) {
            $this->calculateTaskDate($task, $tasks, $calculated);
        }
    }

    /**
     * Рекурсивно рассчитать дату начала задачи
     */
    private function calculateTaskDate(Task $task, Collection $allTasks, array &$calculated): void
    {
        if (isset($calculated[$task->id])) {
            return;
        }

        $earliestStartDate = $task->start_date;

        foreach ($task->dependencies as $dependency) {
            $dependsOnTask = $allTasks->find($dependency->depends_on_task_id);
            if (!$dependsOnTask) {
                continue;
            }

            // Сначала рассчитываем дату зависимости
            $this->calculateTaskDate($dependsOnTask, $allTasks, $calculated);

            $dependencyEndDate = $dependsOnTask->getEndDateAttribute();
            if (!$dependencyEndDate) {
                continue;
            }

            $dependencyStartDate = Carbon::parse($dependencyEndDate)->addDays($dependency->lag_days);

            if (!$earliestStartDate || $dependencyStartDate->gt($earliestStartDate)) {
                $earliestStartDate = $dependencyStartDate;
            }
        }

        if ($earliestStartDate) {
            $task->update([
                'start_date' => $earliestStartDate->format('Y-m-d')
            ]);
        }

        $calculated[$task->id] = true;
    }
}
