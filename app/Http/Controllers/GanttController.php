<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskDependency;
use App\Services\GanttService;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GanttController extends Controller
{
    public function __construct(
        private GanttService   $ganttService,
        private ProjectService $projectService
    )
    {
    }

    /**
     * Показать Гантт диаграмму проекта
     */
    public function show(Project $project, Request $request)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $sprintId = $request->get('sprint_id');
        $ganttData = $this->ganttService->getProjectGanttData($project, $sprintId);

        return Inertia::render('Projects/Gantt', compact('project', 'ganttData', 'sprintId'));
    }

    /**
     * Обновить данные задачи в Гантт диаграмме
     */
    public function updateTask(Request $request, Task $task)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'start_date' => 'nullable|date',
            'duration_days' => 'nullable|integer|min:0',
            'progress_percent' => 'nullable|integer|min:0|max:100',
            'is_milestone' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $updatedTask = $this->ganttService->updateTaskGanttData($task, $request->all());

        // Получаем обновленные зависимости для проекта
        $dependencies = $this->ganttService->getProjectDependencies($task->project);

        return response()->json([
            'success' => true,
            'task' => $updatedTask,
            'dependencies' => $dependencies,
        ]);
    }

    /**
     * Создать зависимость между задачами
     */
    public function createDependency(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'depends_on_task_id' => 'required|exists:tasks,id',
            'type' => 'required|in:finish_to_start,start_to_start,finish_to_finish,start_to_finish',
            'lag_days' => 'nullable|integer|min:0',
        ]);

        $task = Task::findOrFail($request->task_id);

        if (!$this->projectService->canUserManageProject(Auth::user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        try {
            $dependency = $this->ganttService->createDependency(
                $request->task_id,
                $request->depends_on_task_id,
                $request->type,
                $request->lag_days ?? 0
            );

            return response()->json([
                'success' => true,
                'dependency' => $dependency,
                'message' => 'Связь между задачами успешно создана',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Удалить зависимость
     */
    public function deleteDependency(TaskDependency $dependency)
    {
        $task = $dependency->task;

        if (!$this->projectService->canUserManageProject(Auth::user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        $success = $this->ganttService->deleteDependency($dependency->id);

        return response()->json(compact('success'));
    }

    /**
     * Автоматически рассчитать даты задач
     */
    public function calculateDates(Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $this->ganttService->calculateTaskDates($project);

        return response()->json([
            'success' => true,
            'message' => 'Даты задач пересчитаны',
        ]);
    }
}
