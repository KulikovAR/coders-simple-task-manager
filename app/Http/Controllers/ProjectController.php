<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Http\Requests\ProjectRequest;
use App\Services\ProjectService;
use App\Services\TaskStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService,
        private TaskStatusService $taskStatusService
    ) {}

    public function index(Request $request)
    {
        $projects = $this->projectService->getUserProjects(Auth::user(), $request->only(['search', 'status']));

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Form');
    }

    public function store(ProjectRequest $request)
    {
        $project = $this->projectService->createProject($request->validated(), Auth::user());

        return redirect()->route('projects.show', $project)
            ->with('success', 'Проект успешно создан.');
    }

    public function show(Project $project)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $project->load(['owner', 'tasks.assignee', 'tasks.reporter', 'tasks.status:id,name,color,project_id,sprint_id', 'tasks.project', 'taskStatuses', 'members.user']);

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'tasks' => $project->tasks,
        ]);
    }

    public function board(Project $project, Request $request)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $project->load(['tasks.assignee', 'tasks.reporter', 'tasks.status:id,name,color,project_id,sprint_id', 'tasks.sprint', 'tasks.project', 'owner', 'users']);

        // Получаем спринты и определяем активный спринт
        $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();
        $activeSprint = $sprints->where('status', 'active')->first();

        // Логика выбора спринта:
        // 1. Если пользователь явно указал sprint_id - используем его (включая 'none')
        // 2. Если sprint_id не указан и есть активный спринт - используем активный по умолчанию
        // 3. В остальных случаях (нет активного спринта) - используем "без спринта"
        $selectedSprintId = $request->get('sprint_id');
        $selectedSprint = null;

        if ($selectedSprintId !== null) {
            // Пользователь явно указал спринт
            if ($selectedSprintId === 'none') {
                // Пользователь выбрал "без спринта"
                $selectedSprintId = 'none';
                $selectedSprint = null;
            } else {
                // Пользователь выбрал конкретный спринт
                $selectedSprint = $project->sprints()->find($selectedSprintId);
                if (!$selectedSprint) {
                    // Если спринт не найден, сбрасываем на "без спринта"
                    $selectedSprintId = 'none';
                }
            }
        } elseif ($activeSprint) {
            // Если спринт не указан и есть активный спринт, используем его по умолчанию
            $selectedSprintId = $activeSprint->id;
            $selectedSprint = $activeSprint;
        } else {
            // Если нет активного спринта, используем "без спринта"
            $selectedSprintId = 'none';
        }

        // Получаем релевантные статусы с учетом контекста
        $taskStatuses = $this->taskStatusService->getContextualStatuses($project, $selectedSprint);
        $members = collect([$project->owner])->merge($project->users)->unique('id')->values();

        return Inertia::render('Projects/Board', [
            'project' => $project,
            'tasks' => $project->tasks,
            'taskStatuses' => $taskStatuses,
            'sprints' => $sprints,
            'members' => $members,
            'selectedSprintId' => $selectedSprintId,
            'hasCustomStatuses' => $selectedSprint ? $this->taskStatusService->hasCustomStatuses($selectedSprint) : false,
        ]);
    }

    public function edit(Project $project)
    {
        if (!$this->projectService->canUserContributeToProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        return Inertia::render('Projects/Form', compact('project'));
    }

    public function update(ProjectRequest $request, Project $project)
    {
        if (!$this->projectService->canUserContributeToProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $project = $this->projectService->updateProject($project, $request->validated());

        return redirect()->route('projects.show', $project)
            ->with('success', 'Проект успешно обновлен.');
    }

    public function destroy(Project $project)
    {
        if (!$this->projectService->canUserContributeToProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $this->projectService->deleteProject($project);

        return redirect()->route('projects.index')
            ->with('success', 'Проект успешно удален.');
    }

    public function addMember(Request $request, Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'nullable|in:member,viewer',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($project->members()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with('error', 'Пользователь уже является участником проекта.');
        }

        $this->projectService->addMember($project, $user, $request->role ?? 'member');

        return redirect()->back()->with('success', 'Пользователь успешно добавлен к проекту.');
    }

    public function removeMember(Request $request, Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($project->owner_id === $user->id) {
            return redirect()->back()->with('error', 'Нельзя удалить владельца проекта.');
        }

        $this->projectService->removeMember($project, $user);

        return redirect()->back()->with('success', 'Пользователь успешно удален из проекта.');
    }

    public function getMembers(Project $project)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $members = collect([$project->owner])->merge($project->users)->unique('id')->values();

        return response()->json($members);
    }
}
