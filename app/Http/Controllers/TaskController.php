<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Http\Requests\TaskRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['project', 'sprint'])->withCount('comments');

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $tasks = $query->orderBy('created_at', 'desc')->paginate(12);
        $projects = Project::orderBy('name')->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'projects' => $projects,
            'filters' => $request->only(['search', 'status', 'priority', 'project_id']),
        ]);
    }

    public function create(Request $request)
    {
        $projects = Project::orderBy('name')->get();
        $selectedProjectId = $request->get('project_id');

        return Inertia::render('Tasks/Form', [
            'projects' => $projects,
            'selectedProjectId' => $selectedProjectId,
        ]);
    }

    public function store(TaskRequest $request)
    {
        $task = Task::create($request->validated());

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Задача успешно создана.');
    }

    public function show(Task $task)
    {
        $task->load(['project', 'sprint', 'comments.user']);
        
        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function edit(Task $task)
    {
        $projects = Project::orderBy('name')->get();
        
        return Inertia::render('Tasks/Form', [
            'task' => $task,
            'projects' => $projects,
        ]);
    }

    public function update(TaskRequest $request, Task $task)
    {
        $task->update($request->validated());

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Задача успешно обновлена.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->route('tasks.index')
            ->with('success', 'Задача успешно удалена.');
    }
} 