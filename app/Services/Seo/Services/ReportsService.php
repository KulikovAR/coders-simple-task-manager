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

        if (empty($filters['source']) && !empty($site->searchEngines)) {
            $filters['source'] = $site->searchEngines[0];
        }

        $keywords = $this->microserviceClient->getKeywords($siteId);

        $positionFilters = PositionFiltersDTO::fromRequest(['site_id' => $siteId, ...$filters]);

        $positions = $this->microserviceClient->getPositionHistoryWithFilters($positionFilters->toQueryParams());

        $wordstatPositions = [];
        if ($site->wordstatEnabled) {
            $wordstatFilters = PositionFiltersDTO::fromRequest([...$filters, 'site_id' => $siteId, 'source' => 'wordstat']);

            $wordstatPositions = $this->microserviceClient->getPositionHistoryWithFilters($wordstatFilters->toQueryParams());
            
            if (empty($wordstatPositions)) {
                $wordstatPositions = $this->microserviceClient->getPositionHistoryWithFiltersAndLast($wordstatFilters->toQueryParams(), true);
            }
        }

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
