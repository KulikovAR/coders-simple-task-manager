<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class SeoMicroserviceService
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
            $data = json_decode($response->getBody()->getContents(), true);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            Log::error('Failed to fetch sites from SEO microservice', [
                'error' => $e->getMessage(),
            ]);
            return [];
        } catch (\Exception $e) {
            Log::error('Unexpected error fetching sites', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function getSite(int $siteId): ?array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/sites/' . $siteId);
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('Failed to fetch site from SEO microservice', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function createSite(string $domain, string $name): ?array
    {
        try {
            $response = $this->client->post($this->baseUrl . '/api/sites', [
                'json' => [
                    'domain' => $domain,
                    'name' => $name,
                ],
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('Failed to create site in SEO microservice', [
                'domain' => $domain,
                'name' => $name,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
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
            Log::error('Failed to fetch keywords from SEO microservice', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
            ]);
            return [];
        } catch (\Exception $e) {
            Log::error('Unexpected error fetching keywords', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
            ]);
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
            Log::error('Failed to create keyword in SEO microservice', [
                'site_id' => $siteId,
                'value' => $value,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function deleteKeyword(int $keywordId): bool
    {
        try {
            $response = $this->client->delete($this->baseUrl . '/api/keywords/' . $keywordId);
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            Log::error('Failed to delete keyword from SEO microservice', [
                'keyword_id' => $keywordId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function getPositionHistory(int $siteId, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        try {
            $query = ['site_id' => $siteId];
            if ($dateFrom) {
                $query['date_from'] = $dateFrom;
            }
            if ($dateTo) {
                $query['date_to'] = $dateTo;
            }

            $response = $this->client->get($this->baseUrl . '/api/positions/history', [
                'query' => $query,
            ]);
            $data = json_decode($response->getBody()->getContents(), true);
            return is_array($data) ? $data : [];
        } catch (GuzzleException $e) {
            Log::error('Failed to fetch position history from SEO microservice', [
                'site_id' => $siteId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'error' => $e->getMessage(),
            ]);
            return [];
        } catch (\Exception $e) {
            Log::error('Unexpected error fetching position history', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function getLatestPositions(int $siteId): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/positions/latest', [
                'query' => ['site_id' => $siteId],
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('Failed to fetch latest positions from SEO microservice', [
                'site_id' => $siteId,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function trackSitePositions(int $siteId, string $device, ?string $country = null, ?string $lang = null, ?string $os = null, ?bool $ads = null): ?array
    {
        try {
            $data = [
                'site_id' => $siteId,
                'device' => $device,
            ];

            if ($country) {
                $data['country'] = $country;
            }
            if ($lang) {
                $data['lang'] = $lang;
            }
            if ($os) {
                $data['os'] = $os;
            }
            if ($ads !== null) {
                $data['ads'] = $ads;
            }

            $response = $this->client->post($this->baseUrl . '/api/positions/track-site', [
                'json' => $data,
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('Failed to track site positions in SEO microservice', [
                'site_id' => $siteId,
                'device' => $device,
                'error' => $e->getMessage(),
            ]);
            return null;
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

                foreach ($userSites as $siteId) {
                    $siteKeywords = $this->getKeywords($siteId);
                    if (is_array($siteKeywords)) {
                        $keywords = array_merge($keywords, $siteKeywords);
                    }

                    $sitePositions = $this->getPositionHistory($siteId);
                    if (is_array($sitePositions)) {
                        // Группируем по keyword_id + дата (только день) и берем последний элемент
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
            Log::error('SEO Stats error: ' . $e->getMessage());
        }

        return [
            'sites' => array_values($sites),
            'keywords' => $keywords,
            'positions' => $positions,
        ];
    }
}
