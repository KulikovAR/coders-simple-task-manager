<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\DTOs\SiteDTO;
use App\Services\Seo\DTOs\TrackPositionsDTO;
use App\Services\Seo\Services\UserXmlApiSettingsService;

class PositionTrackingService
{
    public function __construct(
        private MicroserviceClient $microserviceClient,
        private SiteService $siteService,
        private UserXmlApiSettingsService $xmlApiSettingsService
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
            $result = $this->callMicroserviceMethod($searchEngine, $trackData->toArray());

            if (!$result) {
                $success = false;
            }
        }

        return $success;
    }

    public function trackWordstatPositions(int $siteId): bool
    {
        $site = $this->siteService->getSite($siteId);

        if (!$site || !$site->wordstatEnabled) {
            return false;
        }

        $wordstatTrackData = $this->buildWordstatTrackData($site);
        return $this->callMicroserviceMethod('wordstat', $wordstatTrackData->toArray());
    }

    private function callMicroserviceMethod(string $searchEngine, array $trackData): bool
    {
        return match ($searchEngine) {
            'google' => $this->microserviceClient->trackGooglePositions($trackData),
            'yandex' => $this->microserviceClient->trackYandexPositions($trackData),
            'wordstat' => $this->microserviceClient->trackWordstatPositions($trackData),
            default => $this->microserviceClient->trackSitePositionsWithFilters($trackData),
        };
    }

    private function buildTrackDataFromProject(SiteDTO $site, string $searchEngine): TrackPositionsDTO
    {
        return match ($searchEngine) {
            'google' => $this->buildGoogleTrackData($site),
            'yandex' => $this->buildYandexTrackData($site),
            default => $this->buildDefaultTrackData($site, $searchEngine)
        };
    }

    private function buildGoogleTrackData(SiteDTO $site): TrackPositionsDTO
    {
        $googleApiData = $this->xmlApiSettingsService->getGoogleApiData();

        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $site->getDevice('google'),
            source: 'google',
            country: $site->getCountry('google'),
            os: $site->getOs('google'),
            ads: $site->getAds(),
            pages: 1,
            subdomains: $site->getSubdomains(),
            xmlApiKey: $googleApiData['apiKey'] ?: null,
            xmlBaseUrl: $googleApiData['baseUrl'] ?: null,
            xmlUserId: $googleApiData['userId'] ?: null
        );
    }

    private function buildYandexTrackData(SiteDTO $site): TrackPositionsDTO
    {
        $googleApiData = $this->xmlApiSettingsService->getGoogleApiData();

        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $site->getDevice('yandex'),
            source: 'yandex',
            country: $site->getCountry('yandex'),
            os: $site->getOs('yandex'),
            ads: $site->getAds(),
            pages: 1,
            subdomains: $site->getSubdomains(),
            xmlApiKey: $googleApiData['apiKey'] ?: null,
            xmlBaseUrl: $googleApiData['baseUrl'] ?: null,
            xmlUserId: $googleApiData['userId'] ?: null,
            lr: $site->getYandexRegion()
        );
    }

    private function buildDefaultTrackData(SiteDTO $site, string $searchEngine): TrackPositionsDTO
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
        $wordstatApiData = $this->xmlApiSettingsService->getWordstatApiData();

        return new TrackPositionsDTO(
            siteId: $site->id,
            device: null,
            source: 'wordstat',
            country: null,
            lang: null,
            os: null,
            ads: false,
            pages: 1,
            subdomains: null,
            xmlApiKey: $wordstatApiData['apiKey'] ?: null,
            xmlBaseUrl: $wordstatApiData['baseUrl'] ?: null,
            xmlUserId: $wordstatApiData['userId'] ?: null,
            regions: $site->getWordstatRegion()
        );
    }

}
