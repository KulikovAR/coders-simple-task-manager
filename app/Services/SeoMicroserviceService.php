<?php

namespace App\Services;

use App\DTOs\SiteDTO;
use App\DTOs\UpdateSiteDTO;
use App\DTOs\TrackPositionsDTO;
use App\DTOs\PositionFiltersDTO;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class SeoMicroserviceService
{
    private Client $client;
    private string $baseUrl;

    public function __construct(
        private SeoSiteService $seoSiteService
    ) {
        $this->baseUrl = config('services.seo_microservice.url', 'http://host.docker.internal:8087');
        $this->client = new Client([
            'timeout' => config('services.seo_microservice.timeout', 30),
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }

    public function getSites(): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/sites');
            return json_decode($response->getBody()->getContents(), true) ?: [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function getSite(int $siteId): ?SiteDTO
    {
        $localData = $this->seoSiteService->findByMicroserviceId($siteId);

        if (!$localData) {
            return null;
        }

        return $localData;
    }

    public function createSite(string $domain, string $name): ?SiteDTO
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/sites', [
                'json' => [
                    'domain' => $domain,
                    'name' => $name,
                ],
            ]);
            $data = json_decode($response->getBody()->getContents(), true);

            if ($data && isset($data['id'])) {
                $this->seoSiteService->create($data['id'], $name);
                return SiteDTO::fromMicroservice($data);
            }

            return null;
        } catch (GuzzleException $e) {
            return null;
        }
    }

    public function updateSite(int $siteId, UpdateSiteDTO $dto): bool
    {
        $success = $this->seoSiteService->update($siteId, $dto);

        if ($dto->keywords !== null && !empty($dto->keywords)) {
            $this->updateSiteKeywords($siteId, $dto->keywords);
        }

        if ($dto->positionLimit !== null) {
            $this->updateSitePositionLimit($siteId, $dto->positionLimit);
        }

        return $success;
    }

    public function getKeywords(int $siteId): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/keywords', [
                'query' => ['site_id' => $siteId],
            ]);
            $data = json_decode($response->getBody()->getContents(), true);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function createKeyword(int $siteId, string $value): ?array
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/keywords', [
                'json' => [
                    'site_id' => $siteId,
                    'value' => $value,
                ],
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            return null;
        }
    }

    public function deleteKeyword(int $keywordId): bool
    {
        try {
            $response = $this->client->delete($this->baseUrl . '/api/keywords/' . $keywordId);
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            return false;
        }
    }

    public function getPositionHistory(int $siteId, ?int $keywordId = null): array
    {
        try {
            $query = ['site_id' => $siteId];
            if ($keywordId) {
                $query['keyword_id'] = $keywordId;
            }

            $response = $this->client->get($this->baseUrl . '/api/positions/history', [
                'query' => $query,
            ]);
            $data = json_decode($response->getBody()->getContents(), true);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function getPositionHistoryWithFilters(PositionFiltersDTO $filters): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/positions/history', [
                'query' => $filters->toQueryParams(),
            ]);
            $data = json_decode($response->getBody()->getContents(), true);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function getUserData(array $userSites): array
    {
        $sites = [];
        $keywords = [];
        $positions = [];

        if (empty($userSites)) {
            return compact('sites', 'keywords', 'positions');
        }

        try {
            $allSites = $this->getSites();
            if (is_array($allSites)) {
                $sites = array_filter($allSites, function ($site) use ($userSites) {
                    return isset($site['id']) && in_array($site['id'], $userSites);
                });

                $sites = $this->seoSiteService->mergeSitesWithLocalData($sites);

                foreach ($userSites as $siteId) {
                    $siteKeywords = $this->getKeywords($siteId);
                    if (is_array($siteKeywords)) {
                        $keywords = array_merge($keywords, $siteKeywords);
                    }

                    $sitePositions = $this->getPositionHistory($siteId);
                    if (is_array($sitePositions)) {
                        $groupedByKeywordAndDate = [];
                        foreach ($sitePositions as $position) {
                            $date = date('Y-m-d', strtotime($position['date']));
                            $key = $position['keyword_id'] . '_' . $date;
                            if (!isset($groupedByKeywordAndDate[$key]) || $position['id'] > $groupedByKeywordAndDate[$key]['id']) {
                                $groupedByKeywordAndDate[$key] = $position;
                            }
                        }
                        $positions = array_merge($positions, array_values($groupedByKeywordAndDate));
                    }
                }
            }
        } catch (\Exception $e) {
            // Silent fail
        }

        return [
            'sites' => array_values($sites),
            'keywords' => $keywords,
            'positions' => $positions,
        ];
    }

    public function trackSitePositions(int $siteId): bool
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/sites/' . $siteId . '/track');
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            return false;
        }
    }

    public function trackSitePositionsWithFilters(TrackPositionsDTO $trackData): bool
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/positions/track-site', [
                'json' => $trackData->toArray(),
            ]);
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            return false;
        }
    }

    public function trackSitePositionsFromProject(int $siteId): bool
    {
        $site = $this->getSite($siteId);

        if (!$site) {
            return false;
        }

        $trackData = $this->buildTrackDataFromProject($site);

        return $this->trackSitePositionsWithFilters($trackData);
    }

    private function buildTrackDataFromProject(SiteDTO $site): TrackPositionsDTO
    {
        // Получаем настройки из проекта
        $searchEngines = $site->searchEngines;
        $regions = $site->regions;
        $deviceSettings = $site->deviceSettings;

        // Определяем поисковую систему (по умолчанию google)
        $source = 'google';
        if (!empty($searchEngines)) {
            $source = in_array('yandex', $searchEngines) ? 'yandex' : 'google';
        }

        // Определяем устройство (по умолчанию desktop)
        $device = 'desktop';
        if (!empty($deviceSettings)) {
            if (isset($deviceSettings['device'])) {
                $device = $deviceSettings['device'];
            }
        }

        // Определяем страну и язык из регионов
        $country = null;
        $lang = null;
        if (!empty($regions)) {
            $country = $regions['country'] ?? null;
            $lang = $regions['lang'] ?? null;
        }

        // Определяем ОС из настроек устройства
        $os = null;
        if (!empty($deviceSettings) && isset($deviceSettings['os'])) {
            $os = $deviceSettings['os'];
        }

        // Реклама по умолчанию выключена
        $ads = false;
        if (!empty($deviceSettings) && isset($deviceSettings['ads'])) {
            $ads = $deviceSettings['ads'];
        }

        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $device,
            source: $source,
            country: $country,
            lang: $lang,
            os: $os,
            ads: $ads,
            pages: 1
        );
    }

    public function updateSiteKeywords(int $siteId, string $keywords): void
    {
        $existingKeywords = $this->getKeywords($siteId);
        $existingValues = array_column($existingKeywords, 'value');

        $newKeywords = array_unique(array_filter(array_map('trim', explode("\n", $keywords))));

        foreach ($existingKeywords as $keyword) {
            if (!in_array($keyword['value'], $newKeywords)) {
                $this->deleteKeyword($keyword['id']);
            }
        }

        foreach ($newKeywords as $keywordValue) {
            if (!empty($keywordValue) && !in_array($keywordValue, $existingValues)) {
                $this->createKeyword($siteId, $keywordValue);
            }
        }
    }

    public function updateSitePositionLimit(int $siteId, int $positionLimit): void
    {
        try {
            $this->client->put($this->baseUrl . '/api/sites/' . $siteId . '/position-limit', [
                'json' => [
                    'position_limit' => $positionLimit
                ]
            ]);
        } catch (GuzzleException $e) {
            // Логируем ошибку, но не прерываем выполнение
            \Log::error('Failed to update position limit for site ' . $siteId . ': ' . $e->getMessage());
        }
    }
}
