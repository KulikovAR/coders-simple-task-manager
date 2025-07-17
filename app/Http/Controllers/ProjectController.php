<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Http\Requests\ProjectRequest;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
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

        $project->load(['owner', 'tasks.assignee', 'tasks.reporter', 'tasks.status', 'tasks.project', 'taskStatuses', 'members.user']);
        
        return Inertia::render('Projects/Show', [
            'project' => $project,
            'tasks' => $project->tasks,
        ]);
    }

    public function board(Project $project)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $project->load(['tasks.assignee', 'tasks.reporter', 'tasks.status', 'tasks.sprint', 'tasks.project']);
        $taskStatuses = $project->taskStatuses()->orderBy('order')->get();
        $sprints = $project->sprints()->orderBy('start_date', 'desc')->get();
        
        return Inertia::render('Projects/Board', [
            'project' => $project,
            'tasks' => $project->tasks,
            'taskStatuses' => $taskStatuses,
            'sprints' => $sprints,
        ]);
    }

    public function edit(Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        return Inertia::render('Projects/Form', [
            'project' => $project,
        ]);
    }

    public function update(ProjectRequest $request, Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $project = $this->projectService->updateProject($project, $request->validated());

        return redirect()->route('projects.show', $project)
            ->with('success', 'Проект успешно обновлен.');
    }

    public function destroy(Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
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
            'role' => 'nullable|in:member,admin',
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
} 