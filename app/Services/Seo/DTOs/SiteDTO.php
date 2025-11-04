<?php

namespace App\Services\Seo\DTOs;

class SiteDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $domain,
        public readonly string $name,
        public readonly array $searchEngines = [],
        public readonly array $regions = [],
        public readonly array $deviceSettings = [],
        public readonly ?int $positionLimit = null,
        public readonly ?bool $subdomains = null,
        public readonly ?array $schedule = null,
        public readonly ?bool $wordstatEnabled = null,
        public readonly ?int $wordstatRegion = null,
        public readonly ?array $wordstatOptions = null,
        public readonly ?string $updatedAt = null,
        public readonly ?string $lastTrackedAt = null,
        public readonly ?string $lastPositionUpdate = null,
        public readonly ?int $keywordsCount = null
    ) {}

    public static function fromMicroservice(array $data): self
    {
        return new self(
            id: $data['id'],
            domain: $data['domain'],
            name: '',
            keywordsCount: $data['keywords_count'] ?? null,
            lastPositionUpdate: $data['last_position_update'] ?? null
        );
    }

    public static function fromLocal(array $data): self
    {
        return new self(
            id: $data['go_seo_site_id'],
            domain: $data['domain'] ?? '',
            name: $data['name'] ?? '',
            searchEngines: $data['search_engines'] ?? [],
            regions: $data['regions'] ?? [],
            deviceSettings: $data['device_settings'] ?? [],
            positionLimit: $data['position_limit'] ?? null,
            subdomains: $data['subdomains'] ?? null,
            schedule: $data['schedule'] ?? null,
            wordstatEnabled: $data['wordstat_enabled'] ?? null,
            wordstatRegion: $data['wordstat_region'] ?? null,
            wordstatOptions: $data['wordstat_options'] ?? null,
            updatedAt: $data['updated_at'] ?? null,
            lastTrackedAt: $data['updated_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'domain' => $this->domain,
            'name' => $this->name,
            'search_engines' => $this->searchEngines,
            'regions' => $this->regions,
            'device_settings' => $this->deviceSettings,
            'position_limit' => $this->positionLimit,
            'subdomains' => $this->subdomains,
            'schedule' => $this->schedule,
            'wordstat_enabled' => $this->wordstatEnabled,
            'wordstat_region' => $this->wordstatRegion,
            'wordstat_options' => $this->wordstatOptions,
            'updated_at' => $this->updatedAt,
            'last_tracked_at' => $this->lastTrackedAt,
            'last_position_update' => $this->lastPositionUpdate,
            'keywords_count' => $this->keywordsCount,
        ];
    }

    public function mergeWith(SiteDTO $other): self
    {
        return new self(
            id: $this->id,
            domain: $other->domain ?: $this->domain,
            name: $other->name ?: $this->name,
            searchEngines: $other->searchEngines ?: $this->searchEngines,
            regions: $other->regions ?: $this->regions,
            deviceSettings: $other->deviceSettings ?: $this->deviceSettings,
            positionLimit: $other->positionLimit ?: $this->positionLimit,
            subdomains: $other->subdomains !== null ? $other->subdomains : $this->subdomains,
            schedule: $other->schedule ?: $this->schedule,
            wordstatEnabled: $other->wordstatEnabled !== null ? $other->wordstatEnabled : $this->wordstatEnabled,
            wordstatRegion: $other->wordstatRegion !== null ? $other->wordstatRegion : $this->wordstatRegion,
            wordstatOptions: $other->wordstatOptions !== null ? $other->wordstatOptions : $this->wordstatOptions,
            updatedAt: $other->updatedAt ?: $this->updatedAt,
            lastTrackedAt: $other->lastTrackedAt ?: $this->lastTrackedAt,
            lastPositionUpdate: $other->lastPositionUpdate ?: $this->lastPositionUpdate,
            keywordsCount: $other->keywordsCount !== null ? $other->keywordsCount : $this->keywordsCount
        );
    }

    public function getDevice(string $searchEngine): string
    {
        $deviceData = $this->deviceSettings[$searchEngine] ?? null;
        return is_array($deviceData) ? ($deviceData['device'] ?? 'desktop') : 'desktop';
    }

    public function getCountry(string $searchEngine): ?string
    {
        $regionData = $this->regions[$searchEngine] ?? null;

        if (is_string($regionData)) {
            return mb_strtolower($regionData);
        }

        if (is_array($regionData) && isset($regionData['code'])) {
            return mb_strtolower($regionData['code']);
        }

        return null;
    }

    public function getLang(string $searchEngine): ?string
    {
        $regionData = $this->regions[$searchEngine] ?? null;
        return is_array($regionData) ? ($regionData['name'] ?? null) : null;
    }

    public function getOs(string $searchEngine): ?string
    {
        $deviceData = $this->deviceSettings[$searchEngine] ?? null;
        return is_array($deviceData) ? ($deviceData['os'] ?? null) : null;
    }

    public function getAds(): bool
    {
        return $this->deviceSettings['ads'] ?? false;
    }

    public function getYandexRegion(): ?int
    {
        $regionData = $this->regions['yandex'] ?? null;
        return is_numeric($regionData) ? (int)$regionData : null;
    }

    public function getWordstatRegion(): ?int
    {
        return $this->wordstatRegion;
    }

    public function getWordstatOptions(): array
    {
        $defaultOptions = ['default' => true];
        if (!$this->wordstatOptions) {
            return $defaultOptions;
        }
        return array_merge($defaultOptions, $this->wordstatOptions);
    }

    public function getSubdomains(): ?bool
    {
        return $this->subdomains;
    }
}
