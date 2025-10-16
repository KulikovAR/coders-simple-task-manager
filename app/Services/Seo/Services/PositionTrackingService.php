<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\DTOs\SiteDTO;
use App\Services\Seo\DTOs\TrackPositionsDTO;

class PositionTrackingService
{
    public function __construct(
        private MicroserviceClient $microserviceClient,
        private SiteService $siteService
    ) {}

    public function trackSitePositionsFromProject(int $siteId): bool
    {
        $site = $this->siteService->getSite($siteId);

        if (!$site) {
            return false;
        }

        $searchEngines = $site->searchEngines;

        if (empty($searchEngines)) {
            $searchEngines = ['google'];
        }

        $success = true;

        foreach ($searchEngines as $searchEngine) {
            $trackData = $this->buildTrackDataFromProject($site, $searchEngine);
            $result = $this->microserviceClient->trackSitePositionsWithFilters($trackData->toArray());

            if (!$result) {
                $success = false;
            }
        }

        // Если включен Wordstat, отправляем дополнительный запрос
        if ($site->wordstatEnabled) {
            $wordstatTrackData = $this->buildWordstatTrackData($site);
            $wordstatResult = $this->microserviceClient->trackSitePositionsWithFilters($wordstatTrackData->toArray());

            if (!$wordstatResult) {
                $success = false;
            }
        }

        return $success;
    }

    private function buildTrackDataFromProject(SiteDTO $site, string $searchEngine): TrackPositionsDTO
    {
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $site->getDevice($searchEngine),
            source: $searchEngine,
            country: $site->getCountry($searchEngine),
            os: $site->getOs($searchEngine),
            ads: $site->getAds(),
            pages: 1,
            subdomains: $site->getSubdomains()
        );
    }

    private function buildWordstatTrackData(SiteDTO $site): TrackPositionsDTO
    {
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: null,
            source: 'wordstat',
            country: null,
            lang: null,
            os: null,
            ads: false,
            pages: 1,
            subdomains: null
        );
    }
}
