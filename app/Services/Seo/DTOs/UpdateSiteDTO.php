<?php

namespace App\Services\Seo\DTOs;

class UpdateSiteDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?array $searchEngines = null,
        public readonly ?array $regions = null,
        public readonly ?array $deviceSettings = null,
        public readonly ?array $targets = null,
        public readonly ?string $keywords = null,
        public readonly ?int $positionLimit = null,
        public readonly ?bool $subdomains = null,
        public readonly ?array $schedule = null,
        public readonly ?bool $wordstatEnabled = null,
        public readonly ?int $wordstatRegion = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        $targets = null;
        if (isset($data['targets']) && is_array($data['targets'])) {
            $targets = array_map(function($target) {
                $domain = null;
                if (isset($target['domain'])) {
                    if (is_array($target['domain']) && !empty($target['domain'])) {
                        $domain = $target['domain']['name'] ?? $target['domain']['canonical_name'] ?? null;
                    } elseif (is_string($target['domain']) && !empty($target['domain'])) {
                        $domain = $target['domain'];
                    }
                }
                
                $region = null;
                if (isset($target['region'])) {
                    if (is_array($target['region']) && !empty($target['region'])) {
                        $region = $target['region']['name'] ?? $target['region']['canonical_name'] ?? null;
                    } elseif (is_string($target['region']) && !empty($target['region'])) {
                        $region = $target['region'];
                    }
                }
                
                $language = $target['language'] ?? null;
                $language = !empty($language) ? $language : null;
                
                $lr = isset($target['lr']) ? ($target['lr'] ? (int)$target['lr'] : null) : null;
                
                $os = $target['os'] ?? null;
                $os = !empty($os) ? $os : null;
                
                $device = $target['device'] ?? 'desktop';
                if ($target['search_engine'] === 'yandex') {
                    $device = 'mobile';
                }
                
                return [
                    'search_engine' => $target['search_engine'],
                    'domain' => $domain,
                    'region' => $region,
                    'language' => $language,
                    'lr' => $lr,
                    'device' => $device,
                    'os' => $os,
                ];
            }, $data['targets']);
        }

        return new self(
            name: $data['name'] ?? null,
            searchEngines: $data['search_engines'] ?? null,
            regions: $data['regions'] ?? null,
            deviceSettings: $data['device_settings'] ?? null,
            targets: $targets,
            keywords: $data['keywords'] ?? null,
            positionLimit: $data['position_limit'] ?? null,
            subdomains: $data['subdomains'] ?? null,
            schedule: $data['schedule'] ?? null,
            wordstatEnabled: $data['wordstat_enabled'] ?? null,
            wordstatRegion: $data['wordstat_region'] ?? null,
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
