<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Services\NotificationService;
use App\Services\ProjectService;
use App\Services\TaskService;
use App\Services\TaskStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService,
        private ProjectService $projectService,
        private NotificationService $notificationService,
        private TaskStatusService $taskStatusService
    ) {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'priority', 'project_id', 'sprint_id', 'assignee_id', 'reporter_id', 'my_tasks']);
        $tasks = $this->taskService->getUserTasks(Auth::user(), $filters);
        $projects = $this->projectService->getUserProjectsList(Auth::user());

        // Для фильтров по исполнителю и создателю — получаем всех пользователей из проектов пользователя
        $users = collect();
        foreach ($projects as $project) {
            $users = $users->merge([$project->owner])->merge($project->users);
        }
        $users = $users->unique('id')->values();

        // Получаем контекстные статусы если выбран проект
        $taskStatuses = collect();
        $sprints = collect();

        if (!empty($filters['project_id'])) {
            $selectedProject = $projects->firstWhere('id', (int)$filters['project_id']);
            if ($selectedProject) {
                // Получаем спринты выбранного проекта
                $sprints = $selectedProject->sprints()->orderBy('start_date', 'desc')->get();

                // Получаем статусы в зависимости от выбранного спринта
                if (!empty($filters['sprint_id'])) {
                    $selectedSprint = $sprints->firstWhere('id', (int)$filters['sprint_id']);
                    if ($selectedSprint) {
                        $taskStatuses = $this->taskStatusService->getContextualStatuses($selectedProject, $selectedSprint);
                    } else {
                        $taskStatuses = $this->taskStatusService->getContextualStatuses($selectedProject);
                    }
                } else {
                    $taskStatuses = $this->taskStatusService->getContextualStatuses($selectedProject);
                }
            }
        }

        // Убеждаемся, что задачи загружены с полной информацией о статусах
        $tasks->load(['status:id,name,color,project_id,sprint_id', 'project', 'assignee', 'reporter', 'sprint']);

        return Inertia::render('Tasks/Index', compact('tasks', 'projects', 'users', 'taskStatuses', 'sprints', 'filters'));
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

                // Получаем статусы с учетом контекста спринта
                $selectedSprint = null;
                if ($selectedSprintId) {
                    $selectedSprint = $sprints->find($selectedSprintId);
                }
                $taskStatuses = $this->taskStatusService->getContextualStatuses($project, $selectedSprint);

                // owner + users (members)
                $members = collect([$project->owner])->merge($project->users)->unique('id')->values();
            }
        }

        return Inertia::render('Tasks/Form', compact('projects', 'selectedProjectId', 'selectedSprintId', 'sprints', 'members', 'taskStatuses'));
    }

    public function store(TaskRequest $request)
    {
        $project = Project::findOrFail($request->validated()['project_id']);

        if (!$this->projectService->canUserContributeToProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $task = $this->taskService->createTask($request->validated(), $project, Auth::user());

        $task->load(['assignee', 'project.users']);

        $this->notificationService->taskCreated($task, Auth::user());

        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $assignee = $task->assignee;
            $this->notificationService->taskAssigned($task, $assignee, Auth::user());
        }


        // Проверяем, это Inertia запрос или обычный
        if ($request->header('X-Inertia')) {
            return redirect()->route('tasks.show', $task)
                ->with('success', 'Задача успешно создана.');
        }

        // Проверяем, это AJAX запрос или обычный
        if ($request->ajax() || $request->wantsJson()) {
            // Возвращаем JSON ответ для AJAX запросов
            return response()->json([
                'success' => true,
                'message' => 'Задача успешно создана.',
                'task' => $task->load(['assignee', 'project', 'status:id,name,color,project_id,sprint_id', 'sprint'])
            ]);
        }

        // Проверяем, пришел ли запрос с доски проекта
        $referer = $request->header('Referer');
        if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
            // Возвращаемся на доску проекта
            return redirect()->route('projects.board', $project)
                ->with('success', 'Задача успешно создана.');
        }

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Задача успешно создана.');
    }

    public function show(Task $task, Request $request)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $task->load(['project.users', 'project.owner', 'sprint', 'status:id,name,color,project_id,sprint_id', 'assignee', 'reporter', 'comments.user']);

        // Если это AJAX запрос из модалки доски, возвращаем JSON
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && $request->has('modal')) {
            return response()->json([
                'props' => [
                    'task' => $task,
                ]
            ]);
        }

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function edit(Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        // Загружаем задачу со связями
        $task->load(['status:id,name,color,project_id,sprint_id', 'project']);

        $projects = $this->projectService->getUserProjectsList(Auth::user());
        // Получаем спринты, участников и статусы для проекта задачи
        $sprints = collect();
        $members = collect();
        $taskStatuses = collect();
        if ($task->project) {
            $project = Project::with(['owner', 'users'])->find($task->project_id);
            $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();

            // Получаем статусы с учетом контекста текущей задачи
            $taskStatuses = $this->taskStatusService->getAvailableStatusesForTask($task, $project);

            $members = collect([$project->owner])->merge($project->users)->unique('id')->values();
        }

        return Inertia::render('Tasks/Form', compact('task', 'projects', 'sprints', 'members', 'taskStatuses'));
    }

    public function update(TaskRequest $request, Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        // Загружаем связанные данные
        $task->load(['assignee', 'project', 'status:id,name,color,project_id,sprint_id']);

        $oldAssigneeId = $task->assignee_id;
        $oldData = $task->toArray();

        $task = $this->taskService->updateTask($task, $request->validated());

        // Уведомляем о назначении задачи, только если изменился исполнитель на нового человека
        if ($task->assignee_id && $task->assignee_id !== $oldAssigneeId) {
            $assignee = $task->assignee;
            $this->notificationService->taskAssigned($task, $assignee, Auth::user());
        }
        // Если исполнитель не изменился, отправляем уведомление об обновлении
        // NotificationService сам проверит необходимость отправки уведомления
        elseif ($oldAssigneeId === $task->assignee_id && $task->assignee_id) {
            $this->notificationService->taskUpdated($task, Auth::user());
        }

        // Не дублируем уведомление о создании при обновлении задачи

        // Проверяем, это Inertia запрос или обычный
        if ($request->header('X-Inertia')) {
            // Для Inertia запросов проверяем, откуда пришел запрос
            $referer = $request->header('Referer');
            if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
                // Возвращаемся на доску проекта
                $projectId = $task->project_id;
                return redirect()->route('projects.board', $projectId)
                    ->with('success', 'Задача успешно обновлена.');
            }

            // По умолчанию возвращаемся к просмотру задачи
            return redirect()->route('tasks.show', $task)
                ->with('success', 'Задача успешно обновлена.');
        }

        // Проверяем, это AJAX запрос или обычный
        if ($request->ajax() || $request->wantsJson()) {
            // Возвращаем JSON ответ для AJAX запросов
            return response()->json([
                'success' => true,
                'message' => 'Задача успешно обновлена.',
                'task' => $task->load(['assignee', 'project', 'status:id,name,color,project_id,sprint_id', 'sprint'])
            ]);
        }

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
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $this->taskService->deleteTask($task);

        return redirect()->route('tasks.index')
            ->with('success', 'Задача успешно удалена.');
    }

    public function updateStatus(Request $request, Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        // Загружаем связанные данные для валидации
        $task->load(['project', 'sprint']);

        $request->validate([
            'status_id' => [
                'required',
                'exists:task_statuses,id',
                new \App\Rules\ValidTaskStatus($task->project, $task->sprint)
            ],
        ]);

        // Загружаем связанные данные
        $task->load(['status:id,name,color,project_id,sprint_id', 'assignee', 'reporter', 'project']);

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
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'priority' => 'required|in:low,medium,high',
        ]);

        // Загружаем связанные данные
        $task->load(['status:id,name,color,project_id,sprint_id', 'assignee', 'reporter', 'project']);

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
            'sprint_id' => $request->get('sprint_id'),
        ]);

        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            Log::warning('Access denied to project', [
                'project_id' => $project->id,
                'user_id' => Auth::id(),
            ]);
            abort(403, 'Доступ запрещен');
        }

        // Получаем контекст спринта если передан
        $sprintId = $request->get('sprint_id');
        $sprint = null;

        if ($sprintId && $sprintId !== 'all') {
            $sprint = $project->sprints()->find($sprintId);
            if (!$sprint) {
                return response()->json(['error' => 'Спринт не найден'], 404);
            }
        }

        // Используем новый контекстный метод
        $taskStatuses = $this->taskStatusService->getContextualStatuses($project, $sprint);

        Log::info('Task statuses loaded', [
            'project_id' => $project->id,
            'sprint_id' => $sprint?->id,
            'has_custom_statuses' => $sprint ? $this->taskStatusService->hasCustomStatuses($sprint) : false,
            'statuses_count' => $taskStatuses->count(),
            'statuses' => $taskStatuses->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'sprint_id' => $s->sprint_id,
                'is_custom' => $s->is_custom
            ])->toArray(),
        ]);

        // Для AJAX запросов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json($taskStatuses->toArray());
        }

        // Для обычных запросов возвращаем данные для Inertia
        return response()->json(['taskStatuses' => $taskStatuses->toArray()]);
    }
}
