<?php

namespace App\Http\Controllers;

use App\DTOs\UpdateSiteDTO;
use App\DTOs\PositionFiltersDTO;
use App\Http\Requests\CreateSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use App\Models\SeoSiteUser;
use App\Services\SeoMicroserviceService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SeoStatsController extends Controller
{
    public function __construct(
        private SeoMicroserviceService $seoService
    ) {}

    public function index()
    {
        $userSites = SeoSiteUser::where('user_id', Auth::id())
            ->pluck('go_seo_site_id')
            ->toArray();

        $data = $this->seoService->getUserData($userSites);

        return Inertia::render('SeoStats/Index', $data);
    }

    public function create()
    {
        return Inertia::render('SeoStats/Create');
    }

    public function storeSite(CreateSiteRequest $request)
    {
        $site = $this->seoService->createSite(
            $request->input('domain'),
            $request->input('name')
        );

        if (!$site) {
            return redirect()->back()->withErrors(['error' => 'Ошибка создания проекта']);
        }

        SeoSiteUser::create([
            'user_id' => Auth::id(),
            'go_seo_site_id' => $site->id,
        ]);

        if ($request->input('keywords')) {
            $this->seoService->updateSiteKeywords($site->id, $request->input('keywords'));
        }

        if ($request->input('position_limit')) {
            $this->seoService->updateSitePositionLimit($site->id, $request->input('position_limit'));
        }

        return redirect()->route('seo-stats.index')->with('success', 'Проект создан');
    }

    public function getProjectData(int $siteId)
    {
        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        $site = $this->seoService->getSite($siteId);

        if (!$site) {
            return response()->json(['error' => 'Сайт не найден'], 404);
        }

        $keywords = $this->seoService->getKeywords($siteId);
        $keywordsText = implode("\n", array_column($keywords, 'value'));

        return response()->json([
            'site' => $site->toArray(),
            'keywords' => $keywordsText,
        ]);
    }

    public function updateSite(int $siteId, UpdateSiteRequest $request)
    {
        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        $dto = UpdateSiteDTO::fromRequest($request->validated());
        $success = $this->seoService->updateSite($siteId, $dto);

        if (!$success) {
            return redirect()->back()->withErrors(['error' => 'Ошибка обновления']);
        }

        return redirect()->back()->with('success', 'Проект обновлен');
    }

    public function destroy(int $siteId)
    {
        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->delete();

        return redirect()->route('seo-stats.index')->with('success', 'Проект удален');
    }

    public function reports(int $siteId)
    {
        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->exists();

        if (!$hasAccess) {
            abort(403);
        }

        $site = $this->seoService->getSite($siteId);

        if (!$site) {
            abort(404);
        }

        $keywords = $this->seoService->getKeywords($siteId);

        // Получаем фильтры из запроса
        $filters = PositionFiltersDTO::fromRequest([
            'site_id' => $siteId,
            'source' => request('source'),
            'date_from' => request('date_from'),
            'date_to' => request('date_to'),
        ]);

        $positions = $this->seoService->getPositionHistoryWithFilters($filters);

        return Inertia::render('SeoStats/Reports', [
            'project' => $site->toArray(),
            'keywords' => $keywords,
            'positions' => $positions,
            'filters' => [
                'source' => $filters->source,
                'date_from' => $filters->dateFrom,
                'date_to' => $filters->dateTo,
            ],
        ]);
    }

    public function trackPositions(int $siteId)
    {
        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'Нет доступа'], 403);
        }

        try {
            $success = $this->seoService->trackSitePositionsFromProject($siteId);
            
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
            $success = $this->seoService->deleteKeyword($keywordId);

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
