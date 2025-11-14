<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\DTOs\PositionFiltersDTO;

class ReportDataCollectorService
{
    public function __construct(
        private MicroserviceClient $microserviceClient
    ) {}

    public function collectStatistics(PositionFiltersDTO $filters): array
    {
        return $this->microserviceClient->getPositionStatistics($filters->toQueryParams());
    }

    public function collectPositionsBatch(array $combinedFilters, int $page, int $perPage): array
    {
        $response = $this->microserviceClient->getCombinedPositions($combinedFilters, $page, $perPage);
        $data = $response['data'] ?? [];

        if (empty($data)) {
            return ['positions' => [], 'keywords' => [], 'hasMore' => false];
        }

        $positions = [];
        $keywords = [];

        foreach ($data as $item) {
            $keywords[] = [
                'id' => $item['keyword_id'],
                'value' => $item['keyword'],
                'site_id' => $item['site_id']
            ];

            if (!empty($item['positions']) && is_array($item['positions'])) {
                foreach ($item['positions'] as $position) {
                    $positions[] = $this->buildPositionData($item, $position);
                }
            }

            if (!empty($item['wordstat']) && $item['wordstat'] !== null) {
                $positions[] = $this->buildWordstatPositionData($item);
            }
        }

        $pagination = $response['pagination'] ?? [];
        $hasMore = isset($pagination['current_page']) && isset($pagination['last_page'])
            ? $pagination['current_page'] < $pagination['last_page']
            : !empty($data);

        return [
            'positions' => $positions,
            'keywords' => $keywords,
            'hasMore' => $hasMore
        ];
    }

    private function buildPositionData(array $item, array $position): array
    {
        return [
            'id' => $item['id'],
            'keyword_id' => $item['keyword_id'],
            'keyword' => $item['keyword'],
            'date' => $position['date'] ?? $item['date'],
            'source' => $position['source'],
            'rank' => $position['rank'],
            'position' => $position['rank'],
            'url' => $position['url'] ?? null,
            'title' => $position['title'] ?? null,
            'device' => $position['device'] ?? null,
            'country' => $position['country'] ?? null,
            'lang' => $position['lang'] ?? null,
            'os' => $position['os'] ?? null,
            'ads' => $position['ads'] ?? false,
            'pages' => $position['pages'] ?? null
        ];
    }

    private function buildWordstatPositionData(array $item): array
    {
        return [
            'id' => $item['id'],
            'keyword_id' => $item['keyword_id'],
            'keyword' => $item['keyword'],
            'date' => $item['date'],
            'source' => 'wordstat',
            'rank' => $item['wordstat']['rank'],
            'position' => $item['wordstat']['rank'],
            'url' => $item['wordstat']['url'] ?? null,
            'title' => $item['wordstat']['title'] ?? null,
            'device' => $item['wordstat']['device'] ?? null,
            'country' => $item['wordstat']['country'] ?? null,
            'lang' => $item['wordstat']['lang'] ?? null,
            'os' => $item['wordstat']['os'] ?? null,
            'ads' => $item['wordstat']['ads'] ?? false,
            'pages' => $item['wordstat']['pages'] ?? null
        ];
    }
}

