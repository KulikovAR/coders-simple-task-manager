<?php

namespace App\DTOs;

class PositionFiltersDTO
{
    public function __construct(
        public readonly int $siteId,
        public readonly ?int $keywordId = null,
        public readonly ?string $device = null,
        public readonly ?string $source = null,
        public readonly ?string $country = null,
        public readonly ?string $lang = null,
        public readonly ?string $os = null,
        public readonly ?bool $ads = null,
        public readonly ?string $dateFrom = null,
        public readonly ?string $dateTo = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            siteId: $data['site_id'],
            keywordId: $data['keyword_id'] ?? null,
            device: $data['device'] ?? null,
            source: $data['source'] ?? null,
            country: $data['country'] ?? null,
            lang: $data['lang'] ?? null,
            os: $data['os'] ?? null,
            ads: $data['ads'] ?? null,
            dateFrom: $data['date_from'] ?? null,
            dateTo: $data['date_to'] ?? null
        );
    }

    public function toQueryParams(): array
    {
        return array_filter([
            'site_id' => $this->siteId,
            'keyword_id' => $this->keywordId,
            'device' => $this->device,
            'source' => $this->source,
            'country' => $this->country,
            'lang' => $this->lang,
            'os' => $this->os,
            'ads' => $this->ads,
            'date_from' => $this->dateFrom,
            'date_to' => $this->dateTo,
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
