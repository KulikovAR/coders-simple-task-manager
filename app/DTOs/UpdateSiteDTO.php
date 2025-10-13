<?php

namespace App\DTOs;

class UpdateSiteDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?array $searchEngines = null,
        public readonly ?array $regions = null,
        public readonly ?array $deviceSettings = null,
        public readonly ?string $keywords = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            searchEngines: $data['search_engines'] ?? null,
            regions: $data['regions'] ?? null,
            deviceSettings: $data['device_settings'] ?? null,
            keywords: $data['keywords'] ?? null
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
        ], fn($value) => $value !== null);
    }
}
