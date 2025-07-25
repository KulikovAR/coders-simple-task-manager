<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\ProjectService;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function __construct(
        private TaskService    $taskService,
        private ProjectService $projectService
    )
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'priority', 'project_id', 'assignee_id', 'reporter_id', 'my_tasks']);
        $tasks = $this->taskService->getUserTasks(Auth::user(), $filters);
        $projects = $this->projectService->getUserProjectsList(Auth::user());

        // Для фильтров по исполнителю и создателю — получаем всех пользователей из проектов пользователя
        $users = collect();
        foreach ($projects as $project) {
            $users = $users->merge([$project->owner])->merge($project->users);
        }
        $users = $users->unique('id')->values();

        return Inertia::render('Tasks/Index', compact('tasks', 'projects', 'users', 'filters'));
    }

    public function create(Request $request)
    {
        $projects = $this->projectService->getUserProjectsList(Auth::user());
        $selectedProjectId = $request->get('project_id') ? (int)$request->get('project_id') : null;
        $selectedSprintId = $request->get('sprint_id') ? (int)$request->get('sprint_id') : null;

        // Получаем спринты и участников для выбранного проекта
        $sprints = collect();
        $members = collect();
        if ($selectedProjectId) {
            $project = Project::with(['owner', 'users'])->find($selectedProjectId);
            if ($project && $this->projectService->canUserAccessProject(Auth::user(), $project)) {
                $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();
                // owner + users (members)
                $members = collect([$project->owner])->merge($project->users)->unique('id')->values();
            }
        }

        return Inertia::render('Tasks/Form', compact('projects', 'selectedProjectId', 'selectedSprintId', 'sprints', 'members'));
    }

    public function store(TaskRequest $request)
    {
        $project = Project::findOrFail($request->validated()['project_id']);

        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $task = $this->taskService->createTask($request->validated(), $project, Auth::user());

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Задача успешно создана.');
    }

    public function show(Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $task->load(['project', 'sprint', 'status', 'comments.user']);

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function edit(Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        // Загружаем задачу со связями
        $task->load(['status', 'project']);

        $projects = $this->projectService->getUserProjectsList(Auth::user());
        // Получаем спринты и участников для проекта задачи
        $sprints = collect();
        $members = collect();
        if ($task->project) {
            $project = Project::with(['owner', 'users'])->find($task->project_id);
            $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();
            $members = collect([$project->owner])->merge($project->users)->unique('id')->values();
        }

        return Inertia::render('Tasks/Form', compact('task', 'projects', 'sprints', 'members'));
    }

    public function update(TaskRequest $request, Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $task = $this->taskService->updateTask($task, $request->validated());

        // Для AJAX-запросов возвращаем JSON
        if ($request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'message' => 'Задача успешно обновлена.',
                'task' => $task->load(['status', 'assignee', 'reporter', 'sprint', 'project'])
            ]);
        }

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Задача успешно обновлена.');
    }

    public function destroy(Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $this->taskService->deleteTask($task);

        return redirect()->route('tasks.index')
            ->with('success', 'Задача успешно удалена.');
    }

    public function updateStatus(Request $request, Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'status_id' => 'required|exists:task_statuses,id',
        ]);

        $status = \App\Models\TaskStatus::findOrFail($request->status_id);
        $task = $this->taskService->updateTaskStatus($task, $status);

        // Для Inertia лучше вернуть JSON, если запрос AJAX
        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'task' => $task]);
        }

        return redirect()->back()->with('success', 'Статус задачи успешно обновлен.');
    }

    public function getProjectSprints(Request $request, Project $project)
    {
        Log::info('getProjectSprints called', [
            'project_id' => $project->id,
            'project_name' => $project->name,
            'user_id' => Auth::id(),
            'user_name' => Auth::user()?->name,
        ]);

        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            Log::warning('Access denied to project', [
                'project_id' => $project->id,
                'user_id' => Auth::id(),
            ]);
            abort(403, 'Доступ запрещен');
        }

        $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();

        Log::info('Sprints loaded', [
            'project_id' => $project->id,
            'sprints_count' => $sprints->count(),
            'sprints' => $sprints->map(fn($s) => ['id' => $s->id, 'name' => $s->name])->toArray(),
        ]);

        // Для AJAX запросов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json($sprints->toArray());
        }

        // Для обычных запросов возвращаем данные для Inertia
        return response()->json(['sprints' => $sprints->toArray()]);
    }
}
