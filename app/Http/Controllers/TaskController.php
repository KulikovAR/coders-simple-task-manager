<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Services\NotificationService;
use App\Services\ProjectService;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService,
        private ProjectService $projectService,
        private NotificationService $notificationService
    ) {
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

        // Получаем все уникальные статусы из проектов пользователя
        $taskStatuses = collect();
        foreach ($projects as $project) {
            $projectStatuses = $project->taskStatuses()->orderBy('order')->get();
            $taskStatuses = $taskStatuses->merge($projectStatuses);
        }

        // Убираем дубликаты и сортируем по порядку
        $taskStatuses = $taskStatuses->unique('name')->sortBy('order')->values();

        return Inertia::render('Tasks/Index', compact('tasks', 'projects', 'users', 'taskStatuses', 'filters'));
    }

    public function create(Request $request)
    {
        $projects = $this->projectService->getUserProjectsList(Auth::user());
        $selectedProjectId = $request->get('project_id') ? (int)$request->get('project_id') : null;
        $selectedSprintId = $request->get('sprint_id') ? (int)$request->get('sprint_id') : null;

        // Получаем спринты, участников и статусы для выбранного проекта
        $sprints = collect();
        $members = collect();
        $taskStatuses = collect();
        if ($selectedProjectId) {
            $project = Project::with(['owner', 'users'])->find($selectedProjectId);
            if ($project && $this->projectService->canUserAccessProject(Auth::user(), $project)) {
                $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();
                $taskStatuses = $project->taskStatuses()->orderBy('order')->get();
                // owner + users (members)
                $members = collect([$project->owner])->merge($project->users)->unique('id')->values();
            }
        }

        return Inertia::render('Tasks/Form', compact('projects', 'selectedProjectId', 'selectedSprintId', 'sprints', 'members', 'taskStatuses'));
    }

    public function store(TaskRequest $request)
    {
        $project = Project::findOrFail($request->validated()['project_id']);

        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $task = $this->taskService->createTask($request->validated(), $project, Auth::user());

        $task->load(['assignee', 'project.users']);

        $this->notificationService->taskCreated($task, Auth::user());

        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $assignee = $task->assignee;
            $this->notificationService->taskAssigned($task, $assignee, Auth::user());
        }

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Задача успешно создана.');
    }

    public function show(Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $task->load(['project', 'sprint', 'status', 'assignee', 'reporter', 'comments.user']);

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
        // Получаем спринты, участников и статусы для проекта задачи
        $sprints = collect();
        $members = collect();
        $taskStatuses = collect();
        if ($task->project) {
            $project = Project::with(['owner', 'users'])->find($task->project_id);
            $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();
            $taskStatuses = $project->taskStatuses()->orderBy('order')->get();
            $members = collect([$project->owner])->merge($project->users)->unique('id')->values();
        }

        return Inertia::render('Tasks/Form', compact('task', 'projects', 'sprints', 'members', 'taskStatuses'));
    }

    public function update(TaskRequest $request, Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        // Загружаем связанные данные
        $task->load(['assignee', 'project']);

        $oldAssigneeId = $task->assignee_id;
        $oldData = $task->toArray();

        $task = $this->taskService->updateTask($task, $request->validated());

        // Уведомляем о назначении задачи, если изменился исполнитель
        if ($task->assignee_id && $task->assignee_id !== $oldAssigneeId && $task->assignee_id !== Auth::id()) {
            $assignee = $task->assignee;
            $this->notificationService->taskAssigned($task, $assignee, Auth::user());
        }

        // Не дублируем уведомление о создании при обновлении задачи

        // Проверяем, пришел ли запрос с доски проекта
        $referer = $request->header('Referer');
        if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
            // Возвращаемся на доску проекта
            $projectId = $task->project_id;
            return redirect()->route('projects.board', $projectId)
                ->with('success', 'Задача успешно обновлена.');
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

        // Загружаем связанные данные
        $task->load(['status', 'assignee', 'reporter', 'project']);

        $oldStatus = $task->status->name;
        $newStatus = TaskStatus::findOrFail($request->status_id);

        $task = $this->taskService->updateTaskStatus($task, $newStatus);

        // Уведомляем о перемещении задачи
        if ($oldStatus !== $newStatus->name) {
            $this->notificationService->taskMoved($task, $oldStatus, $newStatus->name, Auth::user());
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'task' => $task]);
        }

        return redirect()->back()->with('success', 'Статус задачи успешно обновлен.');
    }

    public function updatePriority(Request $request, Task $task)
    {
        if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'priority' => 'required|in:low,medium,high',
        ]);

        // Загружаем связанные данные
        $task->load(['status', 'assignee', 'reporter', 'project']);

        $oldPriority = $task->priority;
        $newPriority = $request->priority;

        $task = $this->taskService->updateTaskPriority($task, $newPriority);

        // Уведомляем об изменении приоритета
        if ($oldPriority !== $newPriority) {
            $this->notificationService->taskPriorityChanged($task, $oldPriority, $newPriority, Auth::user());
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'task' => $task]);
        }

        return redirect()->back()->with('success', 'Приоритет задачи успешно обновлен.');
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

    public function getProjectStatuses(Request $request, Project $project)
    {
        Log::info('getProjectStatuses called', [
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

        $taskStatuses = $project->taskStatuses()->orderBy('order')->get();

        Log::info('Task statuses loaded', [
            'project_id' => $project->id,
            'statuses_count' => $taskStatuses->count(),
            'statuses' => $taskStatuses->map(fn($s) => ['id' => $s->id, 'name' => $s->name])->toArray(),
        ]);

        // Для AJAX запросов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json($taskStatuses->toArray());
        }

        // Для обычных запросов возвращаем данные для Inertia
        return response()->json(['taskStatuses' => $taskStatuses->toArray()]);
    }
}
