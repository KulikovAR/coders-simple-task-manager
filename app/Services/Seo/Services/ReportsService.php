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

        $keywords = $this->microserviceClient->getKeywords($siteId);

        $positionFilters = PositionFiltersDTO::fromRequest(array_merge([
            'site_id' => $siteId,
        ], $filters));

        $positions = $this->microserviceClient->getPositionHistoryWithFilters($positionFilters->toQueryParams());

        return [
            'project' => $site->toArray(),
            'keywords' => $keywords,
            'positions' => $positions,
            'filters' => [
                'source' => $positionFilters->source,
                'date_from' => $positionFilters->dateFrom,
                'date_to' => $positionFilters->dateTo,
            ],
        ];
    }
}
