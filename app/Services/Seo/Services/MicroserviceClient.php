<?php

namespace App\Services\Seo\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class MicroserviceClient
{
    private Client $client;
    private string $baseUrl;

    public function __construct()
    {
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
            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR) ?: [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function getByIds(array $siteIds): array
    {
        if (empty($siteIds)) {
            return [];
        }

        try {
            $response = $this->client->get($this->baseUrl . '/api/sites?ids='.$this->formatIds($siteIds));

            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR) ?: [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function getById(int $siteId): ?array
    {
        return $this->getByIds([$siteId])[0] ?? null;
    }

    public function createSite(string $domain): ?array
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/sites', [
                'json' => ['domain' => $domain],
            ]);
            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
        } catch (GuzzleException $e) {
            return null;
        }
    }

    public function getKeywords(int $siteId): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/keywords', [
                'query' => ['site_id' => $siteId],
            ]);
            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
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
            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
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

            $response = $this->client->get($this->baseUrl . '/api/positions/history', compact('query'));
            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function getPositionHistoryWithFilters(array $filters): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/positions/history', [
                'query' => $filters,
            ]);
            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            return [];
        }
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

    public function trackSitePositionsWithFilters(array $trackData): bool
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/positions/track-site', [
                'json' => $trackData,
            ]);
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            return false;
        }
    }

    private function formatIds(array $ids): ?string
    {
        if (empty($ids)) {
            return null;
        }

        if (count($ids) === 1) {
            return $ids[array_key_first($ids)];
        }

        return implode(',', $ids);
    }
}
