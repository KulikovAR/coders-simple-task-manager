<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
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

        $project->load(['tasks.assignee', 'tasks.reporter', 'tasks.status', 'taskStatuses']);
        
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

        $project->load(['tasks.assignee', 'tasks.reporter', 'tasks.status']);
        $taskStatuses = $project->taskStatuses()->orderBy('order')->get();
        
        return Inertia::render('Projects/Board', [
            'project' => $project,
            'tasks' => $project->tasks,
            'taskStatuses' => $taskStatuses,
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
} 