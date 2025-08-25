<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskChecklist;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TaskChecklistController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    /**
     * Получить все чек-листы задачи
     */
    public function index(Task $task, Request $request)
    {
        if (!$this->projectService->canUserAccessProject($request->user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        $checklists = $task->checklists()->orderBy('sort_order', 'asc')->get();
        
        // Для AJAX запросов или тестов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || app()->environment('testing')) {
            return response()->json([
                'success' => true,
                'checklists' => $checklists
            ]);
        }

        // Для Inertia возвращаем страницу
        return Inertia::render('Tasks/Show', [
            'task' => $task->load(['checklists' => function($query) {
                $query->orderBy('sort_order', 'asc');
            }])
        ]);
    }

    /**
     * Создать новый чек-лист
     */
    public function store(Request $request, Task $task)
    {
        if (!$this->projectService->canUserContributeToProject($request->user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $checklist = $task->checklists()->create([
            'title' => $request->title,
            'is_completed' => false,
        ]);

        // Для AJAX запросов или тестов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || app()->environment('testing')) {
            return response()->json([
                'success' => true,
                'message' => 'Чек-лист успешно создан',
                'checklist' => $checklist
            ]);
        }

        // Для Inertia возвращаемся назад
        return redirect()->back()->with('success', 'Чек-лист успешно создан');
    }

    /**
     * Обновить чек-лист
     */
    public function update(Request $request, Task $task, TaskChecklist $checklist)
    {
        if (!$this->projectService->canUserContributeToProject($request->user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($checklist->task_id !== $task->id) {
            abort(400, 'Чек-лист не принадлежит задаче');
        }

        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $checklist->update([
            'title' => $request->title,
        ]);

        // Для AJAX запросов или тестов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || app()->environment('testing')) {
            return response()->json([
                'success' => true,
                'message' => 'Чек-лист успешно обновлен',
                'checklist' => $checklist
            ]);
        }

        // Для Inertia возвращаемся назад
        return redirect()->back()->with('success', 'Чек-лист успешно обновлен');
    }

    /**
     * Удалить чек-лист
     */
    public function destroy(Request $request, Task $task, TaskChecklist $checklist)
    {
        if (!$this->projectService->canUserContributeToProject($request->user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($checklist->task_id !== $task->id) {
            abort(400, 'Чек-лист не принадлежит задаче');
        }

        $checklist->delete();

        // Для AJAX запросов или тестов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || app()->environment('testing')) {
            return response()->json([
                'success' => true,
                'message' => 'Чек-лист успешно удален'
            ]);
        }

        // Для Inertia возвращаемся назад
        return redirect()->back()->with('success', 'Чек-лист успешно удален');
    }

    /**
     * Переключить статус выполнения чек-листа
     */
    public function toggleStatus(Request $request, Task $task, TaskChecklist $checklist)
    {
        if (!$this->projectService->canUserContributeToProject($request->user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        if ($checklist->task_id !== $task->id) {
            abort(400, 'Чек-лист не принадлежит задаче');
        }

        $checklist->update([
            'is_completed' => !$checklist->is_completed,
        ]);

        // Для AJAX запросов или тестов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || app()->environment('testing')) {
            return response()->json([
                'success' => true,
                'message' => 'Статус чек-листа успешно обновлен',
                'checklist' => $checklist
            ]);
        }

        // Для Inertia возвращаемся назад
        return redirect()->back()->with('success', 'Статус чек-листа успешно обновлен');
    }

    /**
     * Обновить порядок чек-листов
     */
    public function reorder(Request $request, Task $task)
    {
        if (!$this->projectService->canUserContributeToProject($request->user(), $task->project)) {
            abort(403, 'Доступ запрещен');
        }

        $request->validate([
            'checklist_ids' => 'required|array',
            'checklist_ids.*' => 'required|integer|exists:task_checklists,id'
        ]);

        DB::transaction(function () use ($request, $task) {
            foreach ($request->checklist_ids as $index => $checklistId) {
                $checklist = $task->checklists()->find($checklistId);
                if ($checklist) {
                    $checklist->update(['sort_order' => $index + 1]);
                }
            }
        });

        $checklists = $task->checklists()->orderBy('sort_order', 'asc')->get();

        // Для AJAX запросов или тестов возвращаем JSON
        if ($request->ajax() || $request->wantsJson() || app()->environment('testing')) {
            return response()->json([
                'success' => true,
                'message' => 'Порядок чек-листов успешно обновлен',
                'checklists' => $checklists
            ]);
        }

        // Для Inertia возвращаемся назад
        return redirect()->back()->with('success', 'Порядок чек-листов успешно обновлен');
    }
}
