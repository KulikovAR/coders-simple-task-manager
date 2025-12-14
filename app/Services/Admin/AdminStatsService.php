<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\Project;
use App\Models\SeoSite;
use App\Models\SeoRecognitionTask;
use App\Models\WordstatRecognitionTask;
use App\Services\Seo\Services\MicroserviceClient;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminStatsService
{
    public function __construct(
        private MicroserviceClient $microserviceClient
    ) {}

    /**
     * Получить все метрики статистики
     */
    public function getAllStats(?string $dateFrom = null, ?string $dateTo = null): array
    {
        $dateRange = $this->getDateRange($dateFrom, $dateTo);

        return [
            'users' => $this->getUserMetrics($dateRange),
            'projects' => $this->getProjectMetrics($dateRange),
            'seo' => $this->getSeoMetrics($dateRange),
            'date_range' => [
                'from' => $dateRange['from']->toDateString(),
                'to' => $dateRange['to']->toDateString(),
            ],
        ];
    }

    /**
     * Метрики по пользователям
     */
    private function getUserMetrics(array $dateRange): array
    {
        $totalUsers = User::count();
        $newUsers = User::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])->count();

        // Активные пользователи: кто провел съем позиций, создал проекты или добавил ключевые слова
        $activeUsers = $this->getActiveUsers($dateRange);

        // Топ-пользователи по количеству созданных проектов
        $topUsersByProjects = $this->getTopUsersByProjects($dateRange);

        // Топ-пользователи по количеству запусков съемов
        $topUsersByTracking = $this->getTopUsersByTracking($dateRange);

        return [
            'total' => $totalUsers,
            'new' => $newUsers,
            'active' => [
                'count' => $activeUsers['count'],
                'users' => $activeUsers['users'],
            ],
            'top_by_projects' => $topUsersByProjects,
            'top_by_tracking' => $topUsersByTracking,
        ];
    }

    /**
     * Метрики по проектам
     */
    private function getProjectMetrics(array $dateRange): array
    {
        $totalProjects = Project::count();
        $newProjects = Project::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])->count();

        // Проекты по пользователям
        $projectsByUsers = $this->getProjectsByUsers();

        // Топ-проекты по объему ключевых слов
        $topProjectsByKeywords = $this->getTopProjectsByKeywords();

        return [
            'total' => $totalProjects,
            'new' => $newProjects,
            'by_users' => $projectsByUsers,
            'top_by_keywords' => $topProjectsByKeywords,
        ];
    }

    /**
     * Метрики по семантике и съемам
     */
    private function getSeoMetrics(array $dateRange): array
    {
        // Общий объем ключевых слов
        $totalKeywords = $this->getTotalKeywordsCount();
        $avgKeywordsPerProject = $this->getAvgKeywordsPerProject();
        $avgKeywordsPerUser = $this->getAvgKeywordsPerUser();

        // Количество запусков съемов
        $totalTrackingRuns = $this->getTotalTrackingRuns($dateRange);
        $trackingRunsByUsers = $this->getTrackingRunsByUsers($dateRange);
        $trackingRunsByEngines = $this->getTrackingRunsByEngines($dateRange);

        // Частота съемов
        $trackingFrequency = $this->getTrackingFrequency($dateRange);

        return [
            'keywords' => [
                'total' => $totalKeywords,
                'avg_per_project' => $avgKeywordsPerProject,
                'avg_per_user' => $avgKeywordsPerUser,
            ],
            'tracking_runs' => [
                'total' => $totalTrackingRuns,
                'by_users' => $trackingRunsByUsers,
                'by_engines' => $trackingRunsByEngines,
            ],
            'frequency' => $trackingFrequency,
        ];
    }

    /**
     * Получить активных пользователей
     */
    private function getActiveUsers(array $dateRange): array
    {
        // Пользователи, которые провели съем позиций
        $usersWithTracking = SeoRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->orWhereBetween('started_at', [$dateRange['from'], $dateRange['to']])
            ->distinct()
            ->pluck('user_id')
            ->toArray();

        // Пользователи, которые создали проекты
        $usersWithProjects = Project::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->distinct()
            ->pluck('owner_id')
            ->toArray();

        // Пользователи, которые добавили ключевые слова (через создание SEO сайтов)
        $usersWithSeoSites = SeoSite::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->distinct()
            ->pluck('user_id')
            ->toArray();

        // Объединяем всех активных пользователей
        $activeUserIds = array_unique(array_merge($usersWithTracking, $usersWithProjects, $usersWithSeoSites));

        $activeUsers = User::whereIn('id', $activeUserIds)
            ->select('id', 'name', 'email', 'created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->toDateString(),
                ];
            })
            ->toArray();

        return [
            'count' => count($activeUserIds),
            'users' => $activeUsers,
        ];
    }

    /**
     * Топ-пользователи по количеству созданных проектов
     */
    private function getTopUsersByProjects(array $dateRange): array
    {
        return Project::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->select('owner_id', DB::raw('count(*) as projects_count'))
            ->groupBy('owner_id')
            ->orderByDesc('projects_count')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $user = User::find($item->owner_id);
                return [
                    'user_id' => $item->owner_id,
                    'user_name' => $user ? $user->name : 'Unknown',
                    'user_email' => $user ? $user->email : 'Unknown',
                    'projects_count' => $item->projects_count,
                ];
            })
            ->toArray();
    }

    /**
     * Топ-пользователи по количеству запусков съемов
     */
    private function getTopUsersByTracking(array $dateRange): array
    {
        $seoRuns = SeoRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->select('user_id', DB::raw('count(*) as runs_count'))
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $wordstatRuns = WordstatRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->select('user_id', DB::raw('count(*) as runs_count'))
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        // Объединяем данные
        $allUserIds = array_unique(array_merge($seoRuns->keys()->toArray(), $wordstatRuns->keys()->toArray()));
        
        $results = [];
        foreach ($allUserIds as $userId) {
            $seoCount = $seoRuns->get($userId)->runs_count ?? 0;
            $wordstatCount = $wordstatRuns->get($userId)->runs_count ?? 0;
            $total = $seoCount + $wordstatCount;

            $user = User::find($userId);
            $results[] = [
                'user_id' => $userId,
                'user_name' => $user ? $user->name : 'Unknown',
                'user_email' => $user ? $user->email : 'Unknown',
                'seo_runs' => $seoCount,
                'wordstat_runs' => $wordstatCount,
                'total_runs' => $total,
            ];
        }

        // Сортируем по общему количеству запусков
        usort($results, fn($a, $b) => $b['total_runs'] <=> $a['total_runs']);

        return array_slice($results, 0, 10);
    }

    /**
     * Проекты по пользователям
     */
    private function getProjectsByUsers(): array
    {
        return Project::select('owner_id', DB::raw('count(*) as projects_count'))
            ->groupBy('owner_id')
            ->orderByDesc('projects_count')
            ->get()
            ->map(function ($item) {
                $user = User::find($item->owner_id);
                return [
                    'user_id' => $item->owner_id,
                    'user_name' => $user ? $user->name : 'Unknown',
                    'user_email' => $user ? $user->email : 'Unknown',
                    'projects_count' => $item->projects_count,
                ];
            })
            ->toArray();
    }

    /**
     * Топ-проекты по объему ключевых слов
     */
    private function getTopProjectsByKeywords(): array
    {
        $seoSites = SeoSite::all();
        $results = [];

        foreach ($seoSites as $site) {
            try {
                $keywords = $this->microserviceClient->getKeywords($site->go_seo_site_id);
                $keywordsCount = count($keywords);

                if ($keywordsCount > 0) {
                    $user = $site->user;
                    $results[] = [
                        'site_id' => $site->id,
                        'go_seo_site_id' => $site->go_seo_site_id,
                        'site_name' => $site->name,
                        'user_id' => $site->user_id,
                        'user_name' => $user ? $user->name : 'Unknown',
                        'user_email' => $user ? $user->email : 'Unknown',
                        'keywords_count' => $keywordsCount,
                    ];
                }
            } catch (\Exception $e) {
                // Пропускаем ошибки при получении ключевых слов
                continue;
            }
        }

        // Сортируем по количеству ключевых слов
        usort($results, fn($a, $b) => $b['keywords_count'] <=> $a['keywords_count']);

        return array_slice($results, 0, 20);
    }

    /**
     * Общий объем ключевых слов
     */
    private function getTotalKeywordsCount(): int
    {
        $seoSites = SeoSite::all();
        $total = 0;

        foreach ($seoSites as $site) {
            try {
                $keywords = $this->microserviceClient->getKeywords($site->go_seo_site_id);
                $total += count($keywords);
            } catch (\Exception $e) {
                // Пропускаем ошибки
                continue;
            }
        }

        return $total;
    }

    /**
     * Средний объем ключевых слов на проект
     */
    private function getAvgKeywordsPerProject(): float
    {
        $totalKeywords = $this->getTotalKeywordsCount();
        $totalSites = SeoSite::count();

        return $totalSites > 0 ? round($totalKeywords / $totalSites, 2) : 0;
    }

    /**
     * Средний объем ключевых слов на пользователя
     */
    private function getAvgKeywordsPerUser(): float
    {
        $totalKeywords = $this->getTotalKeywordsCount();
        $usersWithSites = SeoSite::distinct('user_id')->count('user_id');

        return $usersWithSites > 0 ? round($totalKeywords / $usersWithSites, 2) : 0;
    }

    /**
     * Общее количество запусков съемов
     */
    private function getTotalTrackingRuns(array $dateRange): int
    {
        $seoRuns = SeoRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])->count();
        $wordstatRuns = WordstatRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])->count();

        return $seoRuns + $wordstatRuns;
    }

    /**
     * Количество запусков съемов по пользователям
     */
    private function getTrackingRunsByUsers(array $dateRange): array
    {
        $seoRuns = SeoRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->select('user_id', DB::raw('count(*) as runs_count'))
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $wordstatRuns = WordstatRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->select('user_id', DB::raw('count(*) as runs_count'))
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $allUserIds = array_unique(array_merge($seoRuns->keys()->toArray(), $wordstatRuns->keys()->toArray()));

        $results = [];
        foreach ($allUserIds as $userId) {
            $user = User::find($userId);
            $results[] = [
                'user_id' => $userId,
                'user_name' => $user ? $user->name : 'Unknown',
                'seo_runs' => $seoRuns->get($userId)->runs_count ?? 0,
                'wordstat_runs' => $wordstatRuns->get($userId)->runs_count ?? 0,
                'total_runs' => ($seoRuns->get($userId)->runs_count ?? 0) + ($wordstatRuns->get($userId)->runs_count ?? 0),
            ];
        }

        return $results;
    }

    /**
     * Количество запусков съемов по поисковикам
     */
    private function getTrackingRunsByEngines(array $dateRange): array
    {
        $seoTasks = SeoRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->get();

        $engines = [
            'google' => 0,
            'yandex' => 0,
            'wordstat' => 0,
        ];

        foreach ($seoTasks as $task) {
            $searchEngines = $task->search_engines ?? [];
            foreach ($searchEngines as $engine) {
                if (isset($engines[$engine])) {
                    $engines[$engine]++;
                }
            }
        }

        // Wordstat задачи отдельно
        $wordstatCount = WordstatRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])->count();
        $engines['wordstat'] += $wordstatCount;

        return $engines;
    }

    /**
     * Частота съемов
     */
    private function getTrackingFrequency(array $dateRange): array
    {
        // По пользователям
        $frequencyByUsers = $this->getTrackingRunsByUsers($dateRange);

        // По проектам (SEO сайтам)
        $frequencyByProjects = SeoRecognitionTask::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->select('site_id', DB::raw('count(*) as runs_count'))
            ->groupBy('site_id')
            ->orderByDesc('runs_count')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                // site_id в SeoRecognitionTask - это go_seo_site_id (ID из микросервиса)
                $site = SeoSite::where('go_seo_site_id', $item->site_id)->first();
                return [
                    'site_id' => $item->site_id,
                    'site_name' => $site ? $site->name : "Site #{$item->site_id}",
                    'runs_count' => $item->runs_count,
                ];
            })
            ->toArray();

        return [
            'by_users' => $frequencyByUsers,
            'by_projects' => $frequencyByProjects,
        ];
    }

    /**
     * Получить диапазон дат
     */
    private function getDateRange(?string $dateFrom = null, ?string $dateTo = null): array
    {
        // Если даты не указаны, используем последний месяц по умолчанию
        if (!$dateFrom || !$dateTo) {
            $to = Carbon::now()->endOfDay();
            $from = Carbon::now()->subMonth()->startOfDay();
        } else {
            try {
                $from = Carbon::parse($dateFrom)->startOfDay();
                $to = Carbon::parse($dateTo)->endOfDay();
                
                // Проверяем, что дата "от" не позже даты "до"
                if ($from->gt($to)) {
                    // Меняем местами, если даты перепутаны
                    [$from, $to] = [$to, $from];
                }
            } catch (\Exception $e) {
                // В случае ошибки парсинга используем значения по умолчанию
                $to = Carbon::now()->endOfDay();
                $from = Carbon::now()->subMonth()->startOfDay();
            }
        }

        return [
            'from' => $from,
            'to' => $to,
        ];
    }
}

