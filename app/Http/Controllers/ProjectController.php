<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Http\Requests\ProjectRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::withCount('tasks');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(12);

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
        $project = Project::create($request->validated());

        return redirect()->route('projects.show', $project)
            ->with('success', 'Проект успешно создан.');
    }

    public function show(Project $project)
    {
        $project->load('tasks');
        
        return Inertia::render('Projects/Show', [
            'project' => $project,
            'tasks' => $project->tasks,
        ]);
    }

    public function edit(Project $project)
    {
        return Inertia::render('Projects/Form', [
            'project' => $project,
        ]);
    }

    public function update(ProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        return redirect()->route('projects.show', $project)
            ->with('success', 'Проект успешно обновлен.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Проект успешно удален.');
    }
} 