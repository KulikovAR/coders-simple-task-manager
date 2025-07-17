<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Sprint;
use App\Services\ProjectService;
use App\Services\SprintService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SprintController extends Controller
{
    public function __construct(
        private SprintService $sprintService,
        private ProjectService $projectService
    ) {}

    public function index(Project $project)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $sprints = $this->sprintService->getProjectSprints($project);
        
        return Inertia::render('Sprints/Index', [
            'project' => $project,
            'sprints' => $sprints,
        ]);
    }

    public function create(Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        return Inertia::render('Sprints/Form', [
            'project' => $project,
            'sprint' => null,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        if (!$this->projectService->canUserManageProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'status' => 'sometimes|in:planned,active,completed',
        ], [
            'name.required' => 'Название спринта обязательно',
            'name.max' => 'Название спринта не может быть длиннее 255 символов',
            'description.max' => 'Описание спринта не может быть длиннее 1000 символов',
            'start_date.required' => 'Дата начала спринта обязательна',
            'start_date.after_or_equal' => 'Дата начала спринта должна быть сегодня или в будущем',
            'end_date.required' => 'Дата окончания спринта обязательна',
            'end_date.after' => 'Дата окончания спринта должна быть после даты начала',
            'status.in' => 'Статус должен быть одним из: planned, active, completed',
        ]);

        $sprint = $this->sprintService->createSprint($request->all(), $project);

        return redirect()->route('sprints.show', [$project, $sprint])
            ->with('success', 'Спринт успешно создан.');
    }

    public function show(Project $project, Sprint $sprint)
    {
        if (!$this->projectService->canUserAccessProject(Auth::user(), $project)) {
            abort(403, 'Доступ запрещен');
        }

        $sprint->load(['tasks.assignee', 'tasks.reporter', 'tasks.status']);
        
        return Inertia::render('Sprints/Show', [
            'project' => $project,
            'sprint' => $sprint,
        ]);
    }

    public function edit(Project $project, Sprint $sprint)
    {
        if (!$this->sprintService->canUserManageSprint(Auth::user(), $sprint)) {
            abort(403, 'Доступ запрещен');
        }

        return Inertia::render('Sprints/Form', [
            'project' => $project,
            'sprint' => $sprint,
        ]);
    }

    public function update(Request $request, Project $project, Sprint $sprint)
    {
        if (!$this->sprintService->canUserManageSprint(Auth::user(), $sprint)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'sometimes|in:planned,active,completed',
        ], [
            'name.required' => 'Название спринта обязательно',
            'name.max' => 'Название спринта не может быть длиннее 255 символов',
            'description.max' => 'Описание спринта не может быть длиннее 1000 символов',
            'start_date.required' => 'Дата начала спринта обязательна',
            'end_date.required' => 'Дата окончания спринта обязательна',
            'end_date.after' => 'Дата окончания спринта должна быть после даты начала',
            'status.in' => 'Статус должен быть одним из: planned, active, completed',
        ]);

        $sprint = $this->sprintService->updateSprint($sprint, $request->all());

        return redirect()->route('sprints.show', [$project, $sprint])
            ->with('success', 'Спринт успешно обновлен.');
    }

    public function destroy(Project $project, Sprint $sprint)
    {
        if (!$this->sprintService->canUserManageSprint(Auth::user(), $sprint)) {
            abort(403, 'Доступ запрещен');
        }

        $this->sprintService->deleteSprint($sprint);

        return redirect()->route('sprints.index', $project)
            ->with('success', 'Спринт успешно удален.');
    }
} 