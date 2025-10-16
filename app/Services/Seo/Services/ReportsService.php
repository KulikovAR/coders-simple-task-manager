<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\DTOs\PositionFiltersDTO;

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
            
            $wordstatPositions = $this->microserviceClient->getPositionHistoryWithFilters($wordstatFilters->toQueryParams());
        }

        // Объединяем позиции с данными частоты
        $mergedPositions = $this->mergePositionsWithWordstat($positions, $wordstatPositions);

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
            return $positions;
        }

        return array_merge($positions, $wordstatPositions);
    }
}
