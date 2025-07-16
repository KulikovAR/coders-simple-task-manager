<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Http\Requests\TaskRequest;
use App\Services\TaskService;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService,
        private ProjectService $projectService
    ) {}

    public function index(Request $request)
    {
        $tasks = $this->taskService->getUserTasks(Auth::user(), $request->only(['search', 'status', 'priority', 'project_id']));
        $projects = $this->projectService->getUserProjectsList(Auth::user());

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'projects' => $projects,
            'filters' => $request->only(['search', 'status', 'priority', 'project_id']),
        ]);
    }

    public function create(Request $request)
    {
        $projects = $this->projectService->getUserProjectsList(Auth::user());
        $selectedProjectId = $request->get('project_id');

        return Inertia::render('Tasks/Form', [
            'projects' => $projects,
            'selectedProjectId' => $selectedProjectId,
        ]);
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

        $task->load(['project', 'sprint', 'comments.user']);
        
        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function edit(Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $projects = $this->projectService->getUserProjectsList(Auth::user());
        
        return Inertia::render('Tasks/Form', [
            'task' => $task,
            'projects' => $projects,
        ]);
    }

    public function update(TaskRequest $request, Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $task = $this->taskService->updateTask($task, $request->validated());

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
} 