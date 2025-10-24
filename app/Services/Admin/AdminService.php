<?php

namespace App\Services\Admin;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class AdminService
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

    /**
     * Получить список джобов с пагинацией
     */
    public function getTrackingJobs(array $filters = []): array
    {
        try {
            $queryParams = array_filter([
                'site_id' => $filters['site_id'] ?? null,
                'status' => $filters['status'] ?? null,
                'page' => $filters['page'] ?? 1,
                'per_page' => min($filters['per_page'] ?? 20, 100),
            ]);

            $response = $this->client->get($this->baseUrl . '/api/tracking-jobs', [
                'query' => $queryParams,
            ]);

            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR) ?: [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                    'has_more' => false
                ],
                'meta' => [
                    'cached' => false,
                    'query_time_ms' => 0
                ]
            ];

        } catch (GuzzleException $e) {
            Log::error('AdminService: Failed to fetch tracking jobs', [
                'message' => $e->getMessage(),
                'filters' => $filters
            ]);

            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                    'has_more' => false
                ],
                'meta' => [
                    'cached' => false,
                    'query_time_ms' => 0
                ]
            ];
        }
    }

    /**
     * Получить детали конкретного джоба
     */
    public function getTrackingJob(string $jobId): ?array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/api/tracking-jobs/' . $jobId);
            return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
        } catch (GuzzleException $e) {
            Log::error('AdminService: Failed to fetch tracking job', [
                'job_id' => $jobId,
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }
}
