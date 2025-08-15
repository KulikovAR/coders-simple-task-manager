<?php

namespace App\Http\Controllers;

use App\Exceptions\StatusHasTasksException;
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

        try {
            $updatedStatuses = $this->taskStatusService->updateProjectStatuses($project, $request->statuses);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Статусы проекта успешно обновлены',
                    'statuses' => $updatedStatuses,
                ]);
            }

            return redirect()->back()->with('success', 'Статусы проекта успешно обновлены');
        } catch (StatusHasTasksException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'status_names' => $e->getStatusNames(),
                ], 422);
            }

            return redirect()->back()->with('error', $e->getMessage());
        }
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

        try {
            $updatedStatuses = $this->taskStatusService->updateSprintStatuses($sprint, $request->statuses);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Статусы спринта успешно обновлены',
                    'statuses' => $updatedStatuses,
                ]);
            }

            return redirect()->back()->with('success', 'Статусы спринта успешно обновлены');
        } catch (StatusHasTasksException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'status_names' => $e->getStatusNames(),
                ], 422);
            }

            return redirect()->back()->with('error', $e->getMessage());
        }
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

        try {
            $this->taskStatusService->deleteSprintStatuses($sprint);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Кастомные статусы спринта удалены. Теперь используются статусы проекта.',
                ]);
            }

            return redirect()->back()->with('success', 'Кастомные статусы спринта удалены. Теперь используются статусы проекта.');
        } catch (StatusHasTasksException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'status_names' => $e->getStatusNames(),
                ], 422);
            }

            return redirect()->back()->with('error', $e->getMessage());
        }
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

    /**
     * Получить контекстные статусы (новый универсальный метод)
     */
    public function getContextualStatuses(Request $request, Project $project)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        // Получаем параметры контекста
        $sprintId = $request->get('sprint_id');
        $taskId = $request->get('task_id');
        
        $sprint = null;
        $task = null;

        // Загружаем спринт если указан
        if ($sprintId && $sprintId !== 'all') {
            $sprint = $project->sprints()->find($sprintId);
            if (!$sprint) {
                return response()->json(['error' => 'Спринт не найден'], 404);
            }
        }

        // Загружаем задачу если указана
        if ($taskId) {
            $task = $project->tasks()->find($taskId);
            if (!$task) {
                return response()->json(['error' => 'Задача не найдена'], 404);
            }
        }

        // Получаем контекстные статусы
        $statuses = $this->taskStatusService->getContextualStatuses($project, $sprint, $task);

        // Добавляем метаинформацию о контексте
        $response = [
            'statuses' => $statuses->toArray(),
            'context' => [
                'project_id' => $project->id,
                'sprint_id' => $sprint?->id,
                'task_id' => $task?->id,
                'has_custom_statuses' => $sprint ? $this->taskStatusService->hasCustomStatuses($sprint) : false,
            ]
        ];

        return response()->json($response);
    }
}