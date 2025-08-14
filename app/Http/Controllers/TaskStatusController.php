<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\TaskStatus;
use App\Services\ProjectService;
use App\Services\TaskStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TaskStatusController extends Controller
{
    public function __construct(
        private TaskStatusService $taskStatusService,
        private ProjectService $projectService
    ) {}

    /**
     * Показать форму управления статусами проекта
     */
    public function projectIndex(Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $taskStatuses = $this->taskStatusService->getProjectStatuses($project);
        
        return Inertia::render('Projects/StatusManagement', [
            'project' => $project->load('owner'),
            'taskStatuses' => $taskStatuses,
            'type' => 'project',
        ]);
    }

    /**
     * Показать форму управления статусами спринта
     */
    public function sprintIndex(Project $project, Sprint $sprint)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($sprint->project_id !== $project->id) {
            abort(404, 'Спринт не найден в этом проекте');
        }

        $taskStatuses = $this->taskStatusService->getSprintStatuses($sprint);
        $hasCustomStatuses = $this->taskStatusService->hasCustomStatuses($sprint);
        $projectStatuses = $this->taskStatusService->getProjectStatuses($project);
        
        return Inertia::render('Projects/StatusManagement', [
            'project' => $project->load('owner'),
            'sprint' => $sprint,
            'taskStatuses' => $taskStatuses,
            'hasCustomStatuses' => $hasCustomStatuses,
            'projectStatuses' => $projectStatuses,
            'type' => 'sprint',
        ]);
    }

    /**
     * Обновить статусы проекта
     */
    public function updateProject(Request $request, Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'statuses' => 'required|array|min:1',
            'statuses.*.name' => 'required|string|max:255',
            'statuses.*.color' => ['required', 'string', 'regex:/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/'],
            'statuses.*.id' => 'nullable|integer|exists:task_statuses,id',
        ]);

        $updatedStatuses = $this->taskStatusService->updateProjectStatuses($project, $request->statuses);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Статусы проекта успешно обновлены',
                'statuses' => $updatedStatuses,
            ]);
        }

        return redirect()->back()->with('success', 'Статусы проекта успешно обновлены');
    }

    /**
     * Создать кастомные статусы для спринта
     */
    public function createSprintStatuses(Request $request, Project $project, Sprint $sprint)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($sprint->project_id !== $project->id) {
            abort(404, 'Спринт не найден в этом проекте');
        }

        $customStatuses = $this->taskStatusService->createCustomSprintStatuses($sprint);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Кастомные статусы спринта успешно созданы',
                'statuses' => $customStatuses,
            ]);
        }

        return redirect()->back()->with('success', 'Кастомные статусы спринта успешно созданы');
    }

    /**
     * Обновить статусы спринта
     */
    public function updateSprint(Request $request, Project $project, Sprint $sprint)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($sprint->project_id !== $project->id) {
            abort(404, 'Спринт не найден в этом проекте');
        }

        $request->validate([
            'statuses' => 'required|array|min:1',
            'statuses.*.name' => 'required|string|max:255',
            'statuses.*.color' => ['required', 'string', 'regex:/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/'],
        ]);

        $updatedStatuses = $this->taskStatusService->updateSprintStatuses($sprint, $request->statuses);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Статусы спринта успешно обновлены',
                'statuses' => $updatedStatuses,
            ]);
        }

        return redirect()->back()->with('success', 'Статусы спринта успешно обновлены');
    }

    /**
     * Удалить кастомные статусы спринта (вернуться к статусам проекта)
     */
    public function deleteSprintStatuses(Request $request, Project $project, Sprint $sprint)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($sprint->project_id !== $project->id) {
            abort(404, 'Спринт не найден в этом проекте');
        }

        // Проверяем, есть ли задачи с кастомными статусами
        $sprintStatuses = $this->taskStatusService->getSprintStatuses($sprint);
        $hasTasksWithCustomStatuses = $sprintStatuses->filter(function ($status) {
            return $status->is_custom && $status->tasks()->count() > 0;
        })->isNotEmpty();

        if ($hasTasksWithCustomStatuses) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Нельзя удалить кастомные статусы: есть задачи с этими статусами',
                ], 422);
            }

            return redirect()->back()->with('error', 'Нельзя удалить кастомные статусы: есть задачи с этими статусами');
        }

        $this->taskStatusService->deleteSprintStatuses($sprint);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Кастомные статусы спринта удалены. Теперь используются статусы проекта.',
            ]);
        }

        return redirect()->back()->with('success', 'Кастомные статусы спринта удалены. Теперь используются статусы проекта.');
    }

    /**
     * Получить статусы для API
     */
    public function getStatuses(Project $project, Sprint $sprint = null)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($sprint && $sprint->project_id !== $project->id) {
            abort(404, 'Спринт не найден в этом проекте');
        }

        $statuses = $this->taskStatusService->getRelevantStatuses($project, $sprint);

        return response()->json($statuses);
    }
}