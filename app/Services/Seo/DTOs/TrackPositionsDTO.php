<?php

namespace App\Services\Seo\DTOs;

class TrackPositionsDTO
{
    public function __construct(
        public readonly int $siteId,
        public readonly string $device,
        public readonly string $source,
        public readonly ?string $country = null,
        public readonly ?string $lang = null,
        public readonly ?string $os = null,
        public readonly bool $ads = false,
        public readonly int $pages = 1,
        public readonly ?bool $subdomains = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            siteId: $data['site_id'],
            device: $data['device'],
            source: $data['source'],
            country: $data['country'] ?? null,
            lang: $data['lang'] ?? null,
            os: $data['os'] ?? null,
            ads: $data['ads'] ?? false,
            pages: $data['pages'] ?? 1,
            subdomains: $data['subdomains'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'site_id' => $this->siteId,
            'device' => $this->device,
            'source' => $this->source,
            'country' => $this->country,
            'lang' => $this->lang,
            'os' => $this->os,
            'ads' => $this->ads,
            'pages' => $this->pages,
            'subdomains' => $this->subdomains,
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
