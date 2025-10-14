<?php

namespace App\Http\Controllers;

use App\Services\Seo\DTOs\UpdateSiteDTO;
use App\Services\Seo\DTOs\PositionFiltersDTO;
use App\Services\Seo\Services\SiteUserService;
use App\Services\Seo\Services\ReportsService;
use App\Services\Seo\Services\PositionTrackingService;
use App\Services\Seo\Services\MicroserviceClient;
use App\Http\Requests\CreateSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use Inertia\Inertia;

class SeoStatsController extends Controller
{
    public function __construct(
        private SiteUserService $siteUserService,
        private ReportsService $reportsService,
        private PositionTrackingService $positionTrackingService,
        private MicroserviceClient $microserviceClient
    ) {}

    public function index()
    {
        $data = $this->siteUserService->getUserSites();
        return Inertia::render('SeoStats/Index', $data);
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

        return Inertia::render('SeoStats/Reports', $data);
    }

    public function trackPositions(int $siteId)
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        try {
            $success = $this->positionTrackingService->trackSitePositionsFromProject($siteId);

            if ($success) {
                return response()->json(['success' => true, 'message' => 'Отслеживание запущено']);
            } else {
                return response()->json(['error' => 'Ошибка запуска отслеживания'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка отслеживания'], 500);
        }
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
