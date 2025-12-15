<?php

namespace App\Http\Controllers;

use App\Helpers\BoardUrlHelper;
use App\Helpers\TaskCodeHelper;
use App\Http\Requests\TaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Rules\ValidTaskStatus;
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
        private TaskService         $taskService,
        private ProjectService      $projectService,
        private NotificationService $notificationService,
        private TaskStatusService   $taskStatusService
    )
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'priority', 'project_id', 'sprint_id', 'assignee_id', 'reporter_id', 'my_tasks', 'tags']);
        $tasks = $this->taskService->getUserTasks(Auth::user(), $filters);
        $projects = $this->projectService->getUserProjectsList(Auth::user());

        $users = collect();
        foreach ($projects as $project) {
            $users = $users->merge([$project->owner])->merge($project->users);
        }
        $users = $users->unique('id')->values();

        $taskStatuses = collect();
        $sprints = collect();

        if (!empty($filters['project_id'])) {
            $selectedProject = $projects->firstWhere('id', (int)$filters['project_id']);
            if ($selectedProject) {
                $sprints = $selectedProject->sprints()->orderBy('start_date', 'desc')->get();

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

        $tasks->load(['status:id,name,color,project_id,sprint_id', 'project', 'assignee', 'reporter', 'sprint']);

        return Inertia::render('Tasks/Index', compact('tasks', 'projects', 'users', 'taskStatuses', 'sprints', 'filters'));
    }

    public function create(Request $request)
    {
        $projects = $this->projectService->getUserProjectsList(Auth::user());
        $selectedProjectId = $request->get('project_id') ? (int)$request->get('project_id') : null;
        $selectedSprintId = $request->get('sprint_id') ? (int)$request->get('sprint_id') : null;

        $sprints = collect();
        $members = collect();
        $taskStatuses = collect();
        if ($selectedProjectId) {
            $project = Project::with(['owner', 'users'])->find($selectedProjectId);
            if ($project && $this->projectService->canUserAccessProject(Auth::user(), $project)) {
                $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();

                $selectedSprint = null;
                if ($selectedSprintId) {
                    $selectedSprint = $sprints->find($selectedSprintId);
                }
                $taskStatuses = $this->taskStatusService->getContextualStatuses($project, $selectedSprint);

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

        $checklists = $request->input('checklists', '[]');

        if (is_string($checklists)) {
            $checklists = json_decode($checklists, true);
        }

        $items = $checklists['items'] ?? [];

        if (is_array($items) && count($items) > 0) {
            foreach ($items as $item) {
                $task->checklists()->create([
                    'title' => $item['title'] ?? '',
                    'is_completed' => $item['is_completed'] ?? false,
                    'sort_order' => $item['sort_order'] ?? 1,
                ]);
            }
        }

        $task->load(['assignee', 'project.users', 'checklists']);

        $this->notificationService->taskCreated($task, Auth::user());

        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $assignee = $task->assignee;
            $this->notificationService->taskAssigned($task, $assignee, Auth::user());
        }

        if ($request->header('X-Inertia')) {
            $referer = $request->header('Referer');
            if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
                $boardUrl = BoardUrlHelper::getBoardUrlFromTask($task);
                return redirect($boardUrl)
                    ->with('success', 'Задача успешно создана.');
            }

            return redirect()->route('tasks.show', $task)
                ->with('success', 'Задача успешно создана.');
        }

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Задача успешно создана.',
                'task' => $task->load(['assignee', 'project', 'status:id,name,color,project_id,sprint_id', 'sprint'])
            ]);
        }

        $referer = $request->header('Referer');
        if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
            $boardUrl = BoardUrlHelper::getBoardUrlFromTask($task);
            return redirect($boardUrl)
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

        $task->load(['project.users', 'project.owner', 'sprint', 'status:id,name,color,project_id,sprint_id', 'assignee', 'reporter', 'comments.user', 'checklists']);

        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && $request->has('modal')) {
            return response()->json([
                'props' => compact('task')
            ]);
        }

        $boardUrl = BoardUrlHelper::getBoardUrlFromTask($task);

        return Inertia::render('Tasks/Show', compact('task', 'boardUrl'));
    }

    public function edit(Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $task->load(['status:id,name,color,project_id,sprint_id', 'project', 'checklists']);

        $projects = $this->projectService->getUserProjectsList(Auth::user());
        $sprints = collect();
        $members = collect();
        $taskStatuses = collect();
        if ($task->project) {
            $project = Project::with(['owner', 'users'])->find($task->project_id);
            $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();

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

        $task->load(['assignee', 'project', 'status:id,name,color,project_id,sprint_id', 'checklists']);

        $oldAssigneeId = $task->assignee_id;

        $task = $this->taskService->updateTask($task, $request->validated());

        if ($task->assignee_id && $task->assignee_id != $oldAssigneeId) {
            $assignee = $task->assignee;
            $this->notificationService->taskAssigned($task, $assignee, Auth::user());
        } elseif ($oldAssigneeId === $task->assignee_id && $task->assignee_id) {
            $this->notificationService->taskUpdated($task, Auth::user());
        }


        // TODO ту мач условий
        if ($request->header('X-Inertia')) {
            $referer = $request->header('Referer');
            if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
                $boardUrl = BoardUrlHelper::getBoardUrlFromTask($task);
                return redirect($boardUrl)
                    ->with('success', 'Задача успешно обновлена.');
            }

            return redirect()->route('tasks.show', $task)
                ->with('success', 'Задача успешно обновлена.');
        }

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Задача успешно обновлена.',
                'task' => $task->load(['assignee', 'project', 'status:id,name,color,project_id,sprint_id', 'sprint'])
            ]);
        }

        $referer = $request->header('Referer');
        if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
            $boardUrl = BoardUrlHelper::getBoardUrlFromTask($task);
            return redirect($boardUrl)
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

        $referer = request()->header('Referer');
        if ($referer && str_contains($referer, '/projects/') && str_contains($referer, '/board')) {
            $boardUrl = BoardUrlHelper::getBoardUrlFromTask($task);
            return redirect($boardUrl)
                ->with('success', 'Задача успешно удалена.');
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Задача успешно удалена.');
    }

    public function updateStatus(Request $request, Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }


        $task->load(['project', 'sprint']);

        $request->validate([
            'status_id' => [
                'required',
                'exists:task_statuses,id',
                new ValidTaskStatus($task->project, $task->sprint)
            ],
        ]);

        $task->load(['status:id,name,color,project_id,sprint_id', 'assignee', 'reporter', 'project']);

        $oldStatus = $task->status->name;
        $newStatus = TaskStatus::findOrFail($request->status_id);

        $task = $this->taskService->updateTaskStatus($task, $newStatus);

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

        $task->load(['status:id,name,color,project_id,sprint_id', 'assignee', 'reporter', 'project']);

        $oldPriority = $task->priority;
        $newPriority = $request->priority;

        $task = $this->taskService->updateTaskPriority($task, $newPriority);

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

        if ($request->ajax() || $request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json($sprints->toArray());
        }

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

        $sprintId = $request->get('sprint_id');
        $sprint = null;

        if ($sprintId && $sprintId !== 'all') {
            $sprint = $project->sprints()->find($sprintId);
            if (!$sprint) {
                return response()->json(['error' => 'Спринт не найден'], 404);
            }
        }

        $taskStatuses = $this->taskStatusService->getContextualStatuses($project, $sprint);

        Log::info('Task statuses loaded', [
            'project_id' => $project->id,
            'sprint_id' => $sprint?->id,
            'has_custom_statuses' => $sprint && $this->taskStatusService->hasCustomStatuses($sprint),
            'statuses_count' => $taskStatuses->count(),
            'statuses' => $taskStatuses->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'sprint_id' => $s->sprint_id,
                'is_custom' => $s->is_custom
            ])->toArray(),
        ]);

        if ($request->ajax() || $request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json($taskStatuses->toArray());
        }

        return response()->json(['taskStatuses' => $taskStatuses->toArray()]);
    }

    /**
     * Показать задачу по коду
     */
    public function showByCode(string $code, Request $request)
    {
        $task = TaskCodeHelper::findTaskByCode($code);

        if (!$task) {
            abort(404, 'Задача не найдена');
        }

        return $this->show($task, $request);
    }

    /**
     * Показать задачу в модалке на доске проекта по коду
     */
    public function showInBoardModal(Project $project, string $code, Request $request)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $task = TaskCodeHelper::findTaskByCode($code);

        if (!$task) {
            abort(404, 'Задача не найдена');
        }

        if ($task->project_id !== $project->id) {
            abort(404, 'Задача не найдена в данном проекте');
        }

        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $project->load(['tasks.assignee', 'tasks.reporter', 'tasks.status:id,name,color,project_id,sprint_id', 'tasks.sprint', 'tasks.project', 'owner', 'users']);

        $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();
        $activeSprint = $sprints->where('status', 'active')->first();

        $selectedSprintId = $request->get('sprint_id');
        $selectedSprint = null;

        // TODO отрефакторить
        if ($selectedSprintId !== null) {
            if ($selectedSprintId === 'none') {
                $selectedSprintId = 'none';
                $selectedSprint = null;
            } else {
                $selectedSprint = $project->sprints()->find($selectedSprintId);
                if (!$selectedSprint) {
                    $selectedSprintId = 'none';
                }
            }
        } elseif ($activeSprint) {
            $selectedSprintId = $activeSprint->id;
            $selectedSprint = $activeSprint;
        } else {
            $selectedSprintId = 'none';
        }

        $taskStatuses = $this->taskStatusService->getContextualStatuses($project, $selectedSprint);
        $members = collect([$project->owner])->merge($project->users)->unique('id')->values();

        $task->load(['project.users', 'project.owner', 'sprint', 'status:id,name,color,project_id,sprint_id', 'assignee', 'reporter', 'comments.user', 'checklists']);


        return Inertia::render('Projects/Board', [
            'project' => $project,
            'tasks' => $project->tasks,
            'taskStatuses' => $taskStatuses,
            'sprints' => $sprints,
            'members' => $members,
            'selectedSprintId' => $selectedSprintId,
            'hasCustomStatuses' => $selectedSprint && $this->taskStatusService->hasCustomStatuses($selectedSprint),
            'modalTaskCode' => $code,
        ]);
    }
}
