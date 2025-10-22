<?php

namespace App\Services\Seo\DTOs;

class UpdateSiteDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?array $searchEngines = null,
        public readonly ?array $regions = null,
        public readonly ?array $deviceSettings = null,
        public readonly ?string $keywords = null,
        public readonly ?int $positionLimit = null,
        public readonly ?bool $subdomains = null,
        public readonly ?array $schedule = null,
        public readonly ?bool $wordstatEnabled = null,
        public readonly ?int $wordstatRegion = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            searchEngines: $data['search_engines'] ?? null,
            regions: $data['regions'] ?? null,
            deviceSettings: $data['device_settings'] ?? null,
            keywords: $data['keywords'] ?? null,
            positionLimit: $data['position_limit'] ?? null,
            subdomains: $data['subdomains'] ?? null,
            schedule: $data['schedule'] ?? null,
            wordstatEnabled: $data['wordstat_enabled'] ?? null,
            wordstatRegion: $data['wordstat_region'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'search_engines' => $this->searchEngines,
            'regions' => $this->regions,
            'device_settings' => $this->deviceSettings,
            'keywords' => $this->keywords,
            'position_limit' => $this->positionLimit,
            'subdomains' => $this->subdomains,
            'schedule' => $this->schedule,
            'wordstat_enabled' => $this->wordstatEnabled,
            'wordstat_region' => $this->wordstatRegion,
        ], fn($value) => $value !== null);
    }
}
