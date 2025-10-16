<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\DTOs\PositionFiltersDTO;
use Illuminate\Support\Facades\Log;

class ReportsService
{
    public function __construct(
        private SiteUserService $siteUserService,
        private MicroserviceClient $microserviceClient
    ) {}

    public function getReportsData(int $siteId, array $filters = []): ?array
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return null;
        }

        $site = $this->siteUserService->getSite($siteId);

        if (!$site) {
            return null;
        }

        // Устанавливаем фильтр по умолчанию, если не указан поисковик
        if (empty($filters['source']) && !empty($site->searchEngines)) {
            $filters['source'] = $site->searchEngines[0];
        }

        $keywords = $this->microserviceClient->getKeywords($siteId);

        $positionFilters = PositionFiltersDTO::fromRequest(array_merge([
            'site_id' => $siteId,
        ], $filters));

        // Загружаем позиции для основного поисковика
        $positions = $this->microserviceClient->getPositionHistoryWithFilters($positionFilters->toQueryParams());

        // Если включен Wordstat, загружаем также данные частоты
        $wordstatPositions = [];
        if ($site->wordstatEnabled) {
            $wordstatFilters = PositionFiltersDTO::fromRequest(array_merge($filters, [
                'site_id' => $siteId,
                'source' => 'wordstat',
            ]));
            
            // Логирование запроса к микросервису
            Log::info('Wordstat request to microservice', [
                'site_id' => $siteId,
                'filters' => $wordstatFilters->toQueryParams(),
                'wordstat_enabled' => $site->wordstatEnabled
            ]);
            
            $wordstatPositions = $this->microserviceClient->getPositionHistoryWithFilters($wordstatFilters->toQueryParams());
            
            // Логирование для отладки
            Log::info('Wordstat positions loaded', [
                'site_id' => $siteId,
                'wordstat_enabled' => $site->wordstatEnabled,
                'wordstat_count' => count($wordstatPositions),
                'wordstat_sample' => array_slice($wordstatPositions, 0, 2)
            ]);
        }

        // Объединяем позиции с данными частоты
        $mergedPositions = $this->mergePositionsWithWordstat($positions, $wordstatPositions);
        
        // Логирование для отладки
        Log::info('Positions merged', [
            'original_count' => count($positions),
            'wordstat_count' => count($wordstatPositions),
            'merged_count' => count($mergedPositions),
            'merged_sample' => array_slice($mergedPositions, 0, 2)
        ]);

        return [
            'project' => $site->toArray(),
            'keywords' => $keywords,
            'positions' => $mergedPositions,
            'filters' => [
                'source' => $positionFilters->source,
                'date_from' => $positionFilters->dateFrom,
                'date_to' => $positionFilters->dateTo,
            ],
        ];
    }

    /**
     * Объединяет позиции с данными Wordstat
     */
    private function mergePositionsWithWordstat(array $positions, array $wordstatPositions): array
    {
        if (empty($wordstatPositions)) {
            Log::info('No wordstat positions to merge');
            return $positions;
        }

        // Логирование структуры данных Wordstat
        Log::info('Wordstat positions structure', [
            'first_position_keys' => array_keys($wordstatPositions[0] ?? []),
            'sample_position' => $wordstatPositions[0] ?? null
        ]);

        // Просто объединяем массивы - позиции Wordstat будут отдельными записями
        $mergedPositions = array_merge($positions, $wordstatPositions);

        Log::info('Positions merged with wordstat', [
            'original_count' => count($positions),
            'wordstat_count' => count($wordstatPositions),
            'merged_count' => count($mergedPositions)
        ]);

        return $mergedPositions;
    }
}
