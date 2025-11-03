<?php

namespace App\Services\Seo\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

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

    public function createKeyword(int $siteId, string $value, ?int $groupId = null): ?array
    {
        try {
            $data = [
                'site_id' => $siteId,
                'value' => $value,
            ];
            
            if ($groupId !== null) {
                $data['group_id'] = $groupId;
            }
            
            $response = $this->client->post($this->baseUrl . '/api/keywords', [
                'json' => $data,
            ]);
            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
        } catch (GuzzleException $e) {
            return null;
        }
    }

    public function updateKeyword(int $keywordId, ?int $groupId = null): bool
    {
        try {
            $data = [];
            if ($groupId !== null) {
                $data['group_id'] = $groupId;
            }
            
            $response = $this->client->put($this->baseUrl . '/api/keywords/' . $keywordId, [
                'json' => $data,
            ]);
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            return false;
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

    public function getPositionHistoryWithFilters(array $filters, int $page = 1, int $perPage = 100): array
    {
        try {
            $queryParams = array_merge($filters, [
                'page' => $page,
                'per_page' => $perPage
            ]);

            $response = $this->client->get($this->baseUrl . '/api/positions/history', [
                'query' => $queryParams,
            ]);
            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function getPositionHistoryWithFiltersAndLast(array $filters, bool $last = false, int $page = 1, int $perPage = 100): array
    {
        try {
            $queryParams = array_merge($filters, [
                'page' => $page,
                'per_page' => $perPage
            ]);
            if ($last) {
                $queryParams['last'] = 'true';
            }

            $response = $this->client->get($this->baseUrl . '/api/positions/history', [
                'query' => $queryParams,
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

    public function trackGooglePositions(array $trackData): ?array
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/positions/track-google', [
                'json' => $trackData,
            ]);

            if ($response->getStatusCode() === 200) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }

            return null;
        } catch (GuzzleException $e) {
            Log::error('Failed to track Google positions', [
                'error' => $e->getMessage(),
                'trackData' => $trackData
            ]);
            return null;
        }
    }

    public function trackYandexPositions(array $trackData): ?array
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/positions/track-yandex', [
                'json' => $trackData,
            ]);

            if ($response->getStatusCode() === 200) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }

            return null;
        } catch (GuzzleException $e) {
            Log::error('Failed to track Yandex positions', [
                'error' => $e->getMessage(),
                'trackData' => $trackData
            ]);
            return null;
        }
    }

    public function trackWordstatPositions(array $trackData): ?array
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/positions/track-wordstat', [
                'json' => $trackData,
            ]);

            if ($response->getStatusCode() === 200) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }

            return null;
        } catch (GuzzleException $e) {
            Log::error('Failed to track Wordstat positions', [
                'error' => $e->getMessage(),
                'trackData' => $trackData
            ]);
            return null;
        }
    }

    public function getPositionStatistics(array $filters): array
    {

        try {
            $response = $this->client->post($this->baseUrl . '/api/positions/statistics', [
                'json' => $filters,
            ]);

            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            Log::error('Failed to get position statistics: ' . $e->getMessage());
            return [];
        }
    }

    public function getCombinedPositions(array $filters, int $page = 1, int $perPage = 50): array
    {
        try {
            $queryParams = [...$filters, 'page' => $page, 'per_page' => $perPage];

            $response = $this->client->get($this->baseUrl . '/api/positions/combined', [
                'query' => $queryParams,
            ]);

            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);

            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            Log::error('Failed to get combined positions: ' . $e->getMessage());
            return [];
        }
    }

    public function getGroups(int $siteId): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/groups', [
                'query' => ['site_id' => $siteId],
            ]);
            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            return [];
        }
    }

    public function createGroup(int $siteId, string $name): ?array
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/groups', [
                'json' => [
                    'site_id' => $siteId,
                    'name' => $name,
                ],
            ]);
            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
        } catch (GuzzleException $e) {
            return null;
        }
    }

    public function updateGroup(int $groupId, string $name): bool
    {
        try {
            $response = $this->client->put($this->baseUrl . '/api/groups/' . $groupId, [
                'json' => ['name' => $name],
            ]);
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            return false;
        }
    }

    public function deleteGroup(int $groupId): bool
    {
        try {
            $response = $this->client->delete($this->baseUrl . '/api/groups/' . $groupId);
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
