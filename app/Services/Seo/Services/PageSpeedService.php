<?php

namespace App\Services\Seo\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class PageSpeedService
{
    private Client $client;
    private string $apiKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.google_pagespeed.api_key');
        $this->apiUrl = config('services.google_pagespeed.api_url', 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
        $this->client = new Client([
            'timeout' => 180, // Увеличено до 180 секунд для медленных сайтов
            'connect_timeout' => 30, // Таймаут подключения
            'headers' => [
                'Accept' => 'application/json',
            ],
        ]);
    }

    /**
     * Получить данные PageSpeed для сайта
     *
     * @param string $url URL сайта для анализа
     * @param string $strategy Стратегия анализа: 'mobile' или 'desktop'
     * @return array|null
     */
    public function getPageSpeedData(string $url, string $strategy = 'mobile'): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('Google PageSpeed API key not configured');
            return null;
        }

        try {
            $response = $this->client->get($this->apiUrl, [
                'timeout' => 180, // Явно указываем таймаут для каждого запроса
                'connect_timeout' => 30,
                'query' => [
                    'url' => $url,
                    'key' => $this->apiKey,
                    'strategy' => $strategy,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!$data) {
                return null;
            }

            return $this->formatPageSpeedData($data);
        } catch (GuzzleException $e) {
            Log::error('PageSpeed API error', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Форматировать данные PageSpeed для удобного использования
     *
     * @param array $data
     * @return array
     */
    private function formatPageSpeedData(array $data): array
    {
        $lighthouseResult = $data['lighthouseResult'] ?? [];
        $loadingExperience = $data['loadingExperience'] ?? [];
        
        $categories = $lighthouseResult['categories'] ?? [];
        $audits = $lighthouseResult['audits'] ?? [];
        $metrics = $loadingExperience['metrics'] ?? [];

        return [
            'url' => $data['id'] ?? null,
            'strategy' => $lighthouseResult['configSettings']['emulatedFormFactor'] ?? 'mobile',
            'fetchTime' => $lighthouseResult['fetchTime'] ?? null,
            'scores' => [
                'performance' => $this->getScore($categories['performance'] ?? null),
                'accessibility' => $this->getScore($categories['accessibility'] ?? null),
                'best_practices' => $this->getScore($categories['best-practices'] ?? null),
                'seo' => $this->getScore($categories['seo'] ?? null),
            ],
            'metrics' => [
                'first_contentful_paint' => $this->getMetricValue($audits['first-contentful-paint'] ?? null),
                'largest_contentful_paint' => $this->getMetricValue($audits['largest-contentful-paint'] ?? null),
                'total_blocking_time' => $this->getMetricValue($audits['total-blocking-time'] ?? null),
                'cumulative_layout_shift' => $this->getMetricValue($audits['cumulative-layout-shift'] ?? null),
                'speed_index' => $this->getMetricValue($audits['speed-index'] ?? null),
                'interactive' => $this->getMetricValue($audits['interactive'] ?? null),
            ],
            'loading_experience' => [
                'overall_category' => $loadingExperience['overall_category'] ?? null,
                'first_contentful_paint' => $this->formatLoadingMetric($metrics['FIRST_CONTENTFUL_PAINT_MS'] ?? null),
                'largest_contentful_paint' => $this->formatLoadingMetric($metrics['LARGEST_CONTENTFUL_PAINT_MS'] ?? null),
                'cumulative_layout_shift' => $this->formatLoadingMetric($metrics['CUMULATIVE_LAYOUT_SHIFT_SCORE'] ?? null),
                'interaction_to_next_paint' => $this->formatLoadingMetric($metrics['INTERACTION_TO_NEXT_PAINT'] ?? null),
            ],
        ];
    }

    /**
     * Получить оценку из категории
     *
     * @param array|null $category
     * @return int|null
     */
    private function getScore(?array $category): ?int
    {
        if (!$category || !isset($category['score'])) {
            return null;
        }

        return (int)round($category['score'] * 100);
    }

    /**
     * Получить значение метрики из аудита
     *
     * @param array|null $audit
     * @return float|null
     */
    private function getMetricValue(?array $audit): ?float
    {
        if (!$audit || !isset($audit['numericValue'])) {
            return null;
        }

        return round($audit['numericValue'], 2);
    }

    /**
     * Форматировать метрику из loading experience
     *
     * @param array|null $metric
     * @return array|null
     */
    private function formatLoadingMetric(?array $metric): ?array
    {
        if (!$metric) {
            return null;
        }

        return [
            'percentile' => $metric['percentile'] ?? null,
            'category' => $metric['category'] ?? null,
        ];
    }
}

