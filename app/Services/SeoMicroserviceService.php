<?php

namespace App\Services;

use App\DTOs\SiteDTO;
use App\DTOs\UpdateSiteDTO;
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
}