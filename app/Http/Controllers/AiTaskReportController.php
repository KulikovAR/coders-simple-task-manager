<?php

namespace App\Http\Controllers;

use App\Models\AiTaskReport;
use App\Models\Project;
use App\Models\Sprint;
use App\Services\AiTaskReportService;
use App\Services\ProjectService;
use App\Services\SprintService;
use App\Services\TaskStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AiTaskReportController extends Controller
{
    private AiTaskReportService $reportService;
    private ProjectService $projectService;
    private SprintService $sprintService;
    private TaskStatusService $statusService;

    public function __construct(
        AiTaskReportService $reportService,
        ProjectService $projectService,
        SprintService $sprintService,
        TaskStatusService $statusService
    ) {
        $this->reportService = $reportService;
        $this->projectService = $projectService;
        $this->sprintService = $sprintService;
        $this->statusService = $statusService;
    }

    /**
     * Отображение страницы с отчетами
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);

        return Inertia::render('Reports/Index', [
            'reports' => $this->reportService->getUserReports($user, $perPage),
            'projects' => $this->projectService->getUserProjectsList($user),
        ]);
    }

    /**
     * Отображение формы создания отчета
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $projectId = $request->get('project_id');

        $projects = $this->projectService->getUserProjectsList($user);
        $sprints = [];
        $statuses = [];

        if ($projectId) {
            $project = Project::findOrFail($projectId);
            $sprints = $this->sprintService->getProjectSprints($project);
            $statuses = $this->statusService->getProjectStatuses($project);
        }

        return Inertia::render('Reports/Form', [
            'projects' => $projects,
            'sprints' => $sprints,
            'statuses' => $statuses,
            'selectedProject' => $projectId ? Project::find($projectId) : null,
        ]);
    }

    /**
     * Генерация отчета
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'status_id' => 'nullable|exists:task_statuses,id',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'priority' => 'nullable|integer|min:1|max:5',
            'tags' => 'nullable|array',
        ]);

        $filters = $request->only([
            'project_id', 'sprint_id', 'status_id',
            'assignee_id', 'reporter_id', 'priority', 'tags'
        ]);

        $result = $this->reportService->generateReport($user, $filters);
        
        if (!$result['success']) {
            return back()->with('error', $result['message']);
        }

        return redirect()->route('reports.show', $result['report']->id)
            ->with('success', 'Отчет успешно сгенерирован');
    }

    /**
     * Отображение отчета
     */
    public function show($id)
    {
        $user = Auth::user();
        $report = $this->reportService->getReport($id, $user);

        if (!$report) {
            abort(404);
        }

        return Inertia::render('Reports/Show', [
            'report' => $report,
            'project' => $report->project,
            'sprint' => $report->sprint,
        ]);
    }

    /**
     * Удаление отчета
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $report = AiTaskReport::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $this->reportService->deleteReport($report);

        return redirect()->route('reports.index')
            ->with('success', 'Отчет успешно удален');
    }

    /**
     * API: Получение списка отчетов
     */
    public function apiIndex(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);

        $paginatedReports = $this->reportService->getUserReports($user, $perPage);

        return response()->json([
            'success' => true,
            'reports' => $paginatedReports->items(),
            'pagination' => [
                'current_page' => $paginatedReports->currentPage(),
                'last_page' => $paginatedReports->lastPage(),
                'per_page' => $paginatedReports->perPage(),
                'total' => $paginatedReports->total(),
            ],
        ]);
    }

    /**
     * API: Получение отчета по ID
     */
    public function apiShow($id)
    {
        $user = Auth::user();
        $report = $this->reportService->getReport($id, $user);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Отчет не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'report' => $report,
            'project' => $report->project,
            'sprint' => $report->sprint,
        ]);
    }

    /**
     * API: Создание отчета
     */
    public function apiStore(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'status_id' => 'nullable|exists:task_statuses,id',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'priority' => 'nullable|integer|min:1|max:5',
            'tags' => 'nullable|array',
        ]);

        $filters = $request->only([
            'project_id', 'sprint_id', 'status_id',
            'assignee_id', 'reporter_id', 'priority', 'tags'
        ]);

        $result = $this->reportService->generateReport($user, $filters);

        return response()->json($result);
    }

    /**
     * API: Удаление отчета
     */
    public function apiDestroy($id)
    {
        $user = Auth::user();
        $report = AiTaskReport::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $success = $this->reportService->deleteReport($report);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Отчет успешно удален' : 'Не удалось удалить отчет',
        ]);
    }

    /**
     * API: Получение списка спринтов для проекта
     */
    public function apiGetSprints($projectId)
    {
        $project = Project::findOrFail($projectId);
        $sprints = $this->sprintService->getProjectSprints($project);

        return response()->json([
            'success' => true,
            'sprints' => $sprints,
        ]);
    }

    /**
     * API: Получение списка статусов для проекта
     */
    public function apiGetStatuses($projectId)
    {
        $project = Project::findOrFail($projectId);
        $statuses = $this->statusService->getProjectStatuses($project);

        return response()->json([
            'success' => true,
            'statuses' => $statuses,
        ]);
    }
}
