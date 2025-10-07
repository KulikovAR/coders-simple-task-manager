<?php

namespace App\Http\Controllers;

use App\Models\SeoSiteUser;
use App\Services\SeoMicroserviceService;
use Illuminate\Http\Request;
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

        return Inertia::render('SeoStats/Index', [
            'auth' => ['user' => Auth::user()],
            'sites' => $data['sites'],
            'keywords' => $data['keywords'],
            'positions' => $data['positions'],
        ]);
    }

    public function storeSite(Request $request)
    {
        $request->validate([
            'domain' => 'required|string|max:255',
            'name' => 'required|string|max:255',
        ]);

        $site = $this->seoService->createSite($request->domain, $request->name);

        if ($site) {
            SeoSiteUser::create([
                'user_id' => Auth::id(),
                'go_seo_site_id' => $site['id'],
            ]);

            return redirect()->back()->with('success', 'Сайт успешно добавлен');
        }

        return redirect()->back()->with('error', 'Ошибка при создании сайта');
    }

    public function storeKeyword(Request $request)
    {
        $request->validate([
            'site_id' => 'required|integer',
            'value' => 'required|string|max:255',
        ]);

        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $request->site_id)
            ->exists();

        if (!$hasAccess) {
            return redirect()->back()->with('error', 'Нет доступа к этому сайту');
        }

        $keyword = $this->seoService->createKeyword($request->site_id, $request->value);

        if ($keyword) {
            return redirect()->back()->with('success', 'Ключевое слово успешно добавлено');
        }

        return redirect()->back()->with('error', 'Ошибка при создании ключевого слова');
    }

    public function destroyKeyword(Request $request, int $keywordId)
    {
        $keyword = $this->seoService->getKeywords($request->site_id);
        $keywordExists = collect($keyword)->contains('id', $keywordId);

        if (!$keywordExists) {
            return redirect()->back()->with('error', 'Ключевое слово не найдено');
        }

        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $request->site_id)
            ->exists();

        if (!$hasAccess) {
            return redirect()->back()->with('error', 'Нет доступа к этому сайту');
        }

        $success = $this->seoService->deleteKeyword($keywordId);

        if ($success) {
            return redirect()->back()->with('success', 'Ключевое слово успешно удалено');
        }

        return redirect()->back()->with('error', 'Ошибка при удалении ключевого слова');
    }

    public function trackPositions(Request $request)
    {
        $request->validate([
            'site_id' => 'required|integer',
            'device' => 'required|string|in:desktop,tablet,mobile',
            'country' => 'nullable|string|max:10',
            'lang' => 'nullable|string|max:10',
            'os' => 'nullable|string|in:ios,android',
            'ads' => 'nullable|boolean',
        ]);

        $hasAccess = SeoSiteUser::where('user_id', Auth::id())
            ->where('go_seo_site_id', $request->site_id)
            ->exists();

        if (!$hasAccess) {
            return redirect()->back()->with('error', 'Нет доступа к этому сайту');
        }

        $result = $this->seoService->trackSitePositions(
            $request->site_id,
            $request->device,
            $request->country,
            $request->lang,
            $request->os,
            $request->ads
        );

        if ($result) {
            return redirect()->back()->with('success', 'Отслеживание позиций запущено');
        }

        return redirect()->back()->with('error', 'Ошибка при запуске отслеживания позиций');
    }
}
