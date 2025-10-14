<?php

namespace App\DTOs;

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
        public readonly ?string $updatedAt = null,
        public readonly ?string $lastTrackedAt = null
    ) {}

    public static function fromMicroservice(array $data): self
    {
        return new self(
            id: $data['id'],
            domain: $data['domain'],
            name: '' // Имя больше не приходит из микросервиса
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
            'updated_at' => $this->updatedAt,
            'last_tracked_at' => $this->lastTrackedAt,
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
            updatedAt: $other->updatedAt ?: $this->updatedAt,
            lastTrackedAt: $other->lastTrackedAt ?: $this->lastTrackedAt
        );
    }
}
