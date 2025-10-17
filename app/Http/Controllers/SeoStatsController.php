<?php

namespace App\Http\Controllers;

use App\Services\Seo\DTOs\UpdateSiteDTO;
use App\Services\Seo\DTOs\PositionFiltersDTO;
use App\Services\Seo\Services\SiteUserService;
use App\Services\Seo\Services\ReportsService;
use App\Services\Seo\Services\PositionTrackingService;
use App\Services\Seo\Services\MicroserviceClient;
use App\Services\Seo\Services\RecognitionTaskService;
use App\Http\Requests\CreateSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use Inertia\Inertia;

class SeoStatsController extends Controller
{
    public function __construct(
        private SiteUserService $siteUserService,
        private ReportsService $reportsService,
        private PositionTrackingService $positionTrackingService,
        private MicroserviceClient $microserviceClient,
        private RecognitionTaskService $recognitionTaskService
    ) {}

    public function index()
    {
        $data = $this->siteUserService->getUserSites();
        
        // Добавляем информацию об активных задачах для каждого сайта
        $data['activeTasks'] = [];
        foreach ($data['sites'] as $site) {
            $activeTask = $this->recognitionTaskService->getActiveTaskForSite($site['id']);
            if ($activeTask) {
                $data['activeTasks'][$site['id']] = [
                    'status' => $activeTask->status,
                    'task_id' => $activeTask->id,
                    'progress_percentage' => $activeTask->progress_percentage,
                    'total_keywords' => $activeTask->total_keywords,
                    'processed_keywords' => $activeTask->processed_keywords,
                    'error_message' => $activeTask->error_message,
                    'started_at' => $activeTask->started_at,
                    'completed_at' => $activeTask->completed_at,
                ];
            }
        }
        
        return Inertia::render('SeoStats/Index', $data);
    }

    public function dashboard()
    {
        return Inertia::render('SeoStats/Dashboard');
    }

    public function create()
    {
        return Inertia::render('SeoStats/Create');
    }

    public function storeSite(CreateSiteRequest $request)
    {
        $site = $this->siteUserService->createSiteForUser(
            $request->input('domain'),
            $request->input('name'),
            $request->validated()
        );

        if (!$site) {
            return redirect()->back()->withErrors(['error' => 'Ошибка создания проекта']);
        }

        return redirect()->route('seo-stats.index')->with('success', 'Проект создан');
    }

    public function getProjectData(int $siteId)
    {
        $data = $this->siteUserService->getSiteData($siteId);

        if (!$data) {
            return response()->json(['error' => 'Нет доступа или сайт не найден'], 403);
        }

        return response()->json($data);
    }

    public function updateSite(int $siteId, UpdateSiteRequest $request)
    {
        $dto = UpdateSiteDTO::fromRequest($request->validated());
        $success = $this->siteUserService->updateSite($siteId, $dto);

        if (!$success) {
            return redirect()->back()->withErrors(['error' => 'Нет доступа или ошибка обновления']);
        }

        return redirect()->back()->with('success', 'Проект обновлен');
    }

    public function destroy(int $siteId)
    {
        $success = $this->siteUserService->deleteSite($siteId);

        if (!$success) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        return redirect()->route('seo-stats.index')->with('success', 'Проект удален');
    }

    public function reports(int $siteId)
    {
        $filters = [
            'source' => request('source'),
            'date_from' => request('date_from'),
            'date_to' => request('date_to'),
        ];

        $data = $this->reportsService->getReportsData($siteId, $filters);

        if (!$data) {
            abort(403);
        }

        // Добавляем информацию об активной задаче для текущего сайта
        $activeTask = $this->recognitionTaskService->getActiveTaskForSite($siteId);
        if ($activeTask) {
            $data['activeTask'] = [
                'status' => $activeTask->status,
                'task_id' => $activeTask->id,
                'progress_percentage' => $activeTask->progress_percentage,
                'total_keywords' => $activeTask->total_keywords,
                'processed_keywords' => $activeTask->processed_keywords,
                'error_message' => $activeTask->error_message,
                'started_at' => $activeTask->started_at,
                'completed_at' => $activeTask->completed_at,
            ];
        }

        return Inertia::render('SeoStats/Reports', $data);
    }

    public function trackPositions(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        $activeTask = $this->recognitionTaskService->getActiveTaskForSite($siteId);
        
        if ($activeTask) {
            return response()->json([
                'success' => true,
                'message' => 'Отслеживание уже запущено',
                'task_id' => $activeTask->id
            ]);
        }

        try {
            $task = $this->recognitionTaskService->createTask($siteId);
            
            return response()->json([
                'success' => true,
                'message' => 'Отслеживание запущено',
                'task_id' => $task->id
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка запуска отслеживания'], 500);
        }
    }

    public function getRecognitionStatus(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        $task = $this->recognitionTaskService->getActiveTaskForSite($siteId);
        
        if (!$task) {
            return response()->json(['status' => 'none']);
        }

        return response()->json([
            'status' => $task->status,
            'task_id' => $task->id,
            'progress_percentage' => $task->progress_percentage,
            'total_keywords' => $task->total_keywords,
            'processed_keywords' => $task->processed_keywords,
            'error_message' => $task->error_message,
            'started_at' => $task->started_at,
            'completed_at' => $task->completed_at,
        ]);
    }

    public function getTaskStatus(int $taskId)
    {
        $task = $this->recognitionTaskService->getTaskStatus($taskId);
        
        if (!$task) {
            return response()->json(['error' => 'Задача не найдена'], 404);
        }

        return response()->json([
            'status' => $task->status,
            'task_id' => $task->id,
            'progress_percentage' => $task->progress_percentage,
            'total_keywords' => $task->total_keywords,
            'processed_keywords' => $task->processed_keywords,
            'error_message' => $task->error_message,
            'started_at' => $task->started_at,
            'completed_at' => $task->completed_at,
        ]);
    }

    public function destroyKeyword(int $keywordId)
    {
        try {
            $success = $this->microserviceClient->deleteKeyword($keywordId);

            if ($success) {
                return response()->json(['success' => true, 'message' => 'Ключевое слово удалено']);
            } else {
                return response()->json(['error' => 'Ошибка удаления ключевого слова'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка удаления'], 500);
        }
    }
}
