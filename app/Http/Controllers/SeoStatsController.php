<?php

namespace App\Http\Controllers;

use App\Services\Seo\DTOs\UpdateSiteDTO;
use App\Services\Seo\DTOs\PositionFiltersDTO;
use App\Services\Seo\Services\SiteUserService;
use App\Services\Seo\Services\ReportsService;
use App\Services\Seo\Services\PositionTrackingService;
use App\Services\Seo\Services\MicroserviceClient;
use App\Services\Seo\Services\RecognitionTaskService;
use App\Services\Seo\Services\WordstatRecognitionTaskService;
use App\Services\Seo\Services\ApiBalanceManager;
use App\Services\Seo\Services\RecognitionCostCalculator;
use App\Services\Seo\Services\WordstatCostCalculator;
use App\Services\Seo\Services\ReportsFiltersService;
use App\Http\Requests\CreateSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SeoStatsController extends Controller
{
    public function __construct(
        private SiteUserService $siteUserService,
        private ReportsService $reportsService,
        private PositionTrackingService $positionTrackingService,
        private MicroserviceClient $microserviceClient,
        private RecognitionTaskService $recognitionTaskService,
        private WordstatRecognitionTaskService $wordstatRecognitionTaskService,
        private ApiBalanceManager $apiBalanceManager,
        private ReportsFiltersService $filtersService,
        private RecognitionCostCalculator $costCalculator,
        private WordstatCostCalculator $wordstatCostCalculator
    ) {}

    public function index()
    {
        $data = $this->siteUserService->getUserSites();

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
        // Получаем данные сайта для определения дефолтных фильтров
        $siteData = $this->siteUserService->getSiteData($siteId);
        if (!$siteData) {
            abort(403);
        }

        $site = $siteData['site'];
        $targets = $siteData['site']['targets'] ?? [];

        // Применяем дефолтные фильтры
        $filtersResult = $this->filtersService->applyDefaultFilters(
            $site,
            $targets,
            'seo-stats.reports',
            $siteId
        );

        // Если нужен редирект - делаем его
        if ($filtersResult['redirect_url']) {
            return redirect($filtersResult['redirect_url']);
        }

        $filters = $filtersResult['filters'];
        $data = $this->reportsService->getReportsData($siteId, $filters);

        if (!$data) {
            abort(403);
        }

        try {
            $groups = $this->microserviceClient->getGroups($siteId);
            $data['groups'] = $groups ?? [];
        } catch (\Exception $e) {
            $data['groups'] = [];
        }

        // Данные сайта уже получены выше
        $data['targets'] = $targets;
        $data['public_token'] = $site['public_token'] ?? null;

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

    public function publicReports(string $token)
    {
        $site = \App\Models\SeoSite::where('public_token', $token)->first();

        if (!$site) {
            abort(404, 'Страница не найдена');
        }

        // Получаем данные сайта для определения дефолтных фильтров
        $siteData = $this->siteUserService->getSiteDataWithoutAuth($site->go_seo_site_id);
        if (!$siteData) {
            abort(404, 'Данные не найдены');
        }

        $siteInfo = $siteData['site'];
        $targets = $siteData['site']['targets'] ?? [];

        // Применяем дефолтные фильтры
        $filtersResult = $this->filtersService->applyDefaultFilters(
            $siteInfo,
            $targets,
            'seo-stats.public-reports',
            $token
        );

        // Если нужен редирект - делаем его
        if ($filtersResult['redirect_url']) {
            return redirect($filtersResult['redirect_url']);
        }

        $filters = $filtersResult['filters'];
        $data = $this->reportsService->getReportsData($site->go_seo_site_id, $filters, true);

        if (!$data) {
            abort(404, 'Данные не найдены');
        }

        try {
            $groups = $this->microserviceClient->getGroups($site->go_seo_site_id);
            $data['groups'] = $groups ?? [];
        } catch (\Exception $e) {
            $data['groups'] = [];
        }

        // Данные сайта уже получены выше
        $data['targets'] = $targets;
        $data['isPublic'] = true;
        $data['publicToken'] = $token;

        return Inertia::render('SeoStats/PublicReports', $data);
    }

    public function getPositions(int $siteId)
    {
        $filters = [
            'source' => request('source'),
            'date_from' => request('date_from'),
            'date_to' => request('date_to'),
            'rank_from' => request('rank_from'),
            'rank_to' => request('rank_to'),
            'date_sort' => request('date_sort'),
            'sort_type' => request('sort_type'),
            'wordstat_sort' => request('wordstat_sort'),
            'group_id' => request('group_id'),
            'wordstat_query_type' => request('wordstat_query_type'),
            'filter_group_id' => request('filter_group_id'),
            'page' => request('page', 1),
            'per_page' => request('per_page', 10),
        ];

        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        return $this->getPositionsData($siteId, $filters, false);
    }

    public function getPublicPositions(string $token)
    {
        $site = \App\Models\SeoSite::where('public_token', $token)->first();

        if (!$site) {
            return response()->json(['error' => 'Страница не найдена'], 404);
        }

        $filters = [
            'source' => request('source'),
            'date_from' => request('date_from'),
            'date_to' => request('date_to'),
            'rank_from' => request('rank_from'),
            'rank_to' => request('rank_to'),
            'date_sort' => request('date_sort'),
            'sort_type' => request('sort_type'),
            'wordstat_sort' => request('wordstat_sort'),
            'group_id' => request('group_id'),
            'wordstat_query_type' => request('wordstat_query_type'),
            'filter_group_id' => request('filter_group_id'),
            'page' => request('page', 1),
            'per_page' => request('per_page', 10),
        ];

        return $this->getPositionsData($site->go_seo_site_id, $filters, true);
    }

    private function getPositionsData(int $siteId, array $filters, bool $skipAuthCheck = false)
    {
        $positionFilters = PositionFiltersDTO::fromRequest(['site_id' => $siteId, ...$filters]);
        
        $combinedFilters = $positionFilters->toQueryParams();
        
        $site = $skipAuthCheck 
            ? $this->siteUserService->getSiteWithoutAuth($siteId)
            : $this->siteUserService->getSite($siteId);
            
        if ($site && $site->wordstatEnabled) {
            $combinedFilters['wordstat'] = true;
        }
        
        $combinedResponse = $this->microserviceClient->getCombinedPositions(
            $combinedFilters, 
            $filters['page'], 
            $filters['per_page']
        );

        $combinedData = $combinedResponse['data'] ?? [];
        $keywords = [];
        $positions = [];
        
        foreach ($combinedData as $item) {
            $keywords[] = [
                'id' => $item['keyword_id'],
                'value' => $item['keyword'],
                'site_id' => $item['site_id']
            ];
            
            if (!empty($item['positions']) && is_array($item['positions'])) {
                foreach ($item['positions'] as $position) {
                    $positions[] = [
                        'id' => $item['id'],
                        'keyword_id' => $item['keyword_id'],
                        'keyword' => $item['keyword'],
                        'date' => $position['date'] ?? $item['date'],
                        'source' => $position['source'],
                        'rank' => $position['rank'],
                        'position' => $position['rank'],
                        'url' => $position['url'] ?? null,
                        'title' => $position['title'] ?? null,
                        'device' => $position['device'] ?? null,
                        'country' => $position['country'] ?? null,
                        'lang' => $position['lang'] ?? null,
                        'os' => $position['os'] ?? null,
                        'ads' => $position['ads'] ?? false,
                        'pages' => $position['pages'] ?? null
                    ];
                }
            }
            
            if (!empty($item['wordstat']) && $item['wordstat'] !== null) {
                $positions[] = [
                    'id' => $item['id'],
                    'keyword_id' => $item['keyword_id'],
                    'keyword' => $item['keyword'],
                    'date' => $item['date'],
                    'source' => 'wordstat',
                    'rank' => $item['wordstat']['rank'],
                    'position' => $item['wordstat']['rank'],
                    'url' => $item['wordstat']['url'] ?? null,
                    'title' => $item['wordstat']['title'] ?? null,
                    'device' => $item['wordstat']['device'] ?? null,
                    'country' => $item['wordstat']['country'] ?? null,
                    'lang' => $item['wordstat']['lang'] ?? null,
                    'os' => $item['wordstat']['os'] ?? null,
                    'ads' => $item['wordstat']['ads'] ?? false,
                    'pages' => $item['wordstat']['pages'] ?? null
                ];
            }
        }

        return response()->json([
            'keywords' => $keywords,
            'positions' => $positions,
            'pagination' => $combinedResponse['pagination'] ?? [],
            'meta' => $combinedResponse['meta'] ?? [],
            'has_more' => $combinedResponse['pagination']['has_more'] ?? false,
            'page' => $filters['page'],
            'per_page' => $filters['per_page']
        ]);
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
            $keywords = $this->microserviceClient->getKeywords($siteId);
            $keywordsCount = count($keywords);
            
            if ($keywordsCount === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Нет ключевых слов для отслеживания'
                ]);
            }

            $site = $this->siteUserService->getSite($siteId);
            if (!$site) {
                return response()->json(['error' => 'Сайт не найден'], 404);
            }

            $searchEngines = $site->searchEngines ?? ['google'];

            $siteData = $this->siteUserService->getSiteData($siteId);
            $targets = $siteData['site']['targets'] ?? [];
            $targetsCount = [];
            $pagesPerKeywordByEngine = [];
            foreach ($searchEngines as $engine) {
                $targetsCount[$engine] = count(array_filter($targets, fn($t) => $t['search_engine'] === $engine)) ?: 1;
                $positionLimit = $site->getPositionLimit($engine);
                $pagesPerKeywordByEngine[$engine] = $positionLimit ? (int)ceil($positionLimit / 10) : 1;
            }

            $validation = $this->costCalculator->validateRecognitionRequest(
                $keywordsCount,
                10,
                $searchEngines,
                $targetsCount,
                $targets,
                $pagesPerKeywordByEngine
            );

            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'error' => implode(', ', $validation['errors']),
                    'cost_calculation' => $validation['cost_calculation'] ?? null
                ]);
            }

            $task = $this->recognitionTaskService->createTask($siteId, $searchEngines);

            return response()->json([
                'success' => true,
                'message' => 'Отслеживание запущено',
                'task_id' => $task->id,
                'cost_calculation' => $validation['cost_calculation']
            ]);
        } catch (\Exception $e) {
            Log::error('Track positions error', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Ошибка запуска отслеживания'], 500);
        }
    }

    public function getRecognitionCost(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        try {
            $keywords = $this->microserviceClient->getKeywords($siteId);
            $keywordsCount = count($keywords);
            
            if ($keywordsCount === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Нет ключевых слов для отслеживания'
                ]);
            }

            $site = $this->siteUserService->getSite($siteId);
            if (!$site) {
                return response()->json(['error' => 'Сайт не найден'], 404);
            }

            $searchEngines = $site->searchEngines ?? ['google'];

            $siteData = $this->siteUserService->getSiteData($siteId);
            $targets = $siteData['site']['targets'] ?? [];
            $targetsCount = [];
            $pagesPerKeywordByEngine = [];
            foreach ($searchEngines as $engine) {
                $targetsCount[$engine] = count(array_filter($targets, fn($t) => $t['search_engine'] === $engine)) ?: 1;
                $positionLimit = $site->getPositionLimit($engine);
                $pagesPerKeywordByEngine[$engine] = $positionLimit ? (int)ceil($positionLimit / 10) : 1;
            }

            $costCalculation = $this->costCalculator->calculateRecognitionCost(
                $keywordsCount,
                10,
                $searchEngines,
                $targetsCount,
                $targets,
                $pagesPerKeywordByEngine
            );

            return response()->json([
                'success' => true,
                'cost_calculation' => $costCalculation
            ]);
        } catch (\Exception $e) {
            Log::error('Get recognition cost error', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Ошибка расчета стоимости'], 500);
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

    public function trackWordstatPositions(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        $activeTask = $this->wordstatRecognitionTaskService->getActiveTaskForSite($siteId);

        if ($activeTask) {
            return response()->json([
                'success' => true,
                'message' => 'Парсинг Wordstat уже запущен',
                'task_id' => $activeTask->id
            ]);
        }

        try {
            $keywords = $this->microserviceClient->getKeywords($siteId);
            $keywordsCount = count($keywords);
            
            if ($keywordsCount === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Нет ключевых слов для парсинга Wordstat'
                ]);
            }

            $site = $this->siteUserService->getSite($siteId);
            if (!$site || !$site->wordstatEnabled) {
                return response()->json([
                    'success' => false,
                    'error' => 'Wordstat не включен для данного сайта'
                ]);
            }

            $validation = $this->wordstatCostCalculator->validateWordstatRequest($keywordsCount);

            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'error' => implode(', ', $validation['errors']),
                    'cost_calculation' => $validation['cost_calculation'] ?? null
                ]);
            }

            $task = $this->wordstatRecognitionTaskService->createTask($siteId);

            return response()->json([
                'success' => true,
                'message' => 'Парсинг Wordstat запущен',
                'task_id' => $task->id,
                'cost_calculation' => $validation['cost_calculation']
            ]);
        } catch (\Exception $e) {
            Log::error('Track wordstat positions error', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Ошибка запуска парсинга Wordstat'], 500);
        }
    }

    public function getWordstatCost(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        try {
            $keywords = $this->microserviceClient->getKeywords($siteId);
            $keywordsCount = count($keywords);
            
            if ($keywordsCount === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Нет ключевых слов для парсинга Wordstat'
                ]);
            }

            $site = $this->siteUserService->getSite($siteId);
            if (!$site || !$site->wordstatEnabled) {
                return response()->json([
                    'success' => false,
                    'error' => 'Wordstat не включен для данного сайта'
                ]);
            }

            $costCalculation = $this->wordstatCostCalculator->calculateWordstatCost($keywordsCount);

            return response()->json([
                'success' => true,
                'cost_calculation' => $costCalculation
            ]);
        } catch (\Exception $e) {
            Log::error('Get wordstat cost error', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Ошибка расчета стоимости Wordstat'], 500);
        }
    }

    public function getWordstatRecognitionStatus(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        $task = $this->wordstatRecognitionTaskService->getActiveTaskForSite($siteId);

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

    public function getWordstatTaskStatus(int $taskId)
    {
        $task = $this->wordstatRecognitionTaskService->getTaskStatus($taskId);

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

    public function getGroups(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        try {
            $groups = $this->microserviceClient->getGroups($siteId);
            return response()->json($groups);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка получения групп'], 500);
        }
    }

    public function storeGroup(int $siteId, \Illuminate\Http\Request $request)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $group = $this->microserviceClient->createGroup($siteId, $request->input('name'));

            if ($group) {
                return response()->json(['success' => true, 'group' => $group]);
            } else {
                return response()->json(['error' => 'Ошибка создания группы'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка создания группы'], 500);
        }
    }

    public function updateGroup(int $groupId, \Illuminate\Http\Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $success = $this->microserviceClient->updateGroup($groupId, $request->input('name'));

            if ($success) {
                return response()->json(['success' => true, 'message' => 'Группа обновлена']);
            } else {
                return response()->json(['error' => 'Ошибка обновления группы'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка обновления группы'], 500);
        }
    }

    public function generatePublicToken(int $siteId)
    {
        $site = \App\Models\SeoSite::where('go_seo_site_id', $siteId)
            ->where('user_id', \Illuminate\Support\Facades\Auth::id())
            ->first();

        if (!$site) {
            return response()->json(['error' => 'Сайт не найден'], 404);
        }

        // Генерируем токен, если его еще нет
        if (!$site->public_token) {
            $site->public_token = \Illuminate\Support\Str::random(64);
            $site->save();
        }

        $publicUrl = route('seo-stats.public-reports', $site->public_token);

        return response()->json([
            'success' => true,
            'token' => $site->public_token,
            'url' => $publicUrl
        ]);
    }

    public function destroyGroup(int $groupId)
    {
        try {
            $success = $this->microserviceClient->deleteGroup($groupId);

            if ($success) {
                return response()->json(['success' => true, 'message' => 'Группа удалена']);
            } else {
                return response()->json(['error' => 'Ошибка удаления группы'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка удаления группы'], 500);
        }
    }
}
