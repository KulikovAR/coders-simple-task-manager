<?php

namespace App\Services\Seo\DTOs;

class PositionFiltersDTO
{
    public function __construct(
        public readonly int $siteId,
        public readonly ?int $keywordId = null,
        public readonly ?int $groupId = null,
        public readonly ?string $device = null,
        public readonly ?string $source = null,
        public readonly ?string $country = null,
        public readonly ?string $lang = null,
        public readonly ?string $os = null,
        public readonly ?bool $ads = null,
        public readonly ?string $dateFrom = null,
        public readonly ?string $dateTo = null,
        public readonly ?int $rankFrom = null,
        public readonly ?int $rankTo = null,
        public readonly ?string $dateSort = null,
        public readonly ?string $sortType = null,
        public readonly ?string $wordstatSort = null,
        public readonly ?string $wordstatQueryType = null,
        public readonly ?int $filterGroupId = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            siteId: $data['site_id'],
            keywordId: $data['keyword_id'] ?? null,
            groupId: isset($data['group_id']) ? (int)$data['group_id'] : null,
            device: $data['device'] ?? null,
            source: $data['source'] ?? null,
            country: $data['country'] ?? null,
            lang: $data['lang'] ?? null,
            os: $data['os'] ?? null,
            ads: $data['ads'] ?? null,
            dateFrom: $data['date_from'] ?? null,
            dateTo: $data['date_to'] ?? null,
            rankFrom: isset($data['rank_from']) ? (int)$data['rank_from'] : null,
            rankTo: isset($data['rank_to']) ? (int)$data['rank_to'] : null,
            dateSort: $data['date_sort'] ?? null,
            sortType: $data['sort_type'] ?? null,
            wordstatSort: $data['wordstat_sort'] ?? null,
            wordstatQueryType: $data['wordstat_query_type'] ?? null,
            filterGroupId: isset($data['filter_group_id']) ? (int)$data['filter_group_id'] : null
        );
    }

    public function toQueryParams(): array
    {
        return array_filter([
            'site_id' => $this->siteId,
            'keyword_id' => $this->keywordId,
            'group_id' => $this->groupId,
            'device' => $this->device,
            'source' => $this->source,
            'country' => $this->country,
            'lang' => $this->lang,
            'os' => $this->os,
            'ads' => $this->ads,
            'date_from' => $this->dateFrom,
            'date_to' => $this->dateTo,
            'rank_from' => $this->rankFrom,
            'rank_to' => $this->rankTo,
            'date_sort' => $this->dateSort,
            'sort_type' => $this->sortType,
            'wordstat_sort' => $this->wordstatSort,
            'wordstat_query_type' => $this->wordstatQueryType,
            'filter_group_id' => $this->filterGroupId,
            'limit' => 500,
        ], fn($value) => $value !== null);
    }

    public function getDeviceOptions(): array
    {
        return ['desktop', 'tablet', 'mobile'];
    }

    public function getSourceOptions(): array
    {
        return ['google', 'yandex'];
    }

    public function getOsOptions(): array
    {
        return ['ios', 'android'];
    }
}
