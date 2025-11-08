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
        public readonly ?array $keywordGroups = null,
        public readonly ?int $positionLimitYandex = null,
        public readonly ?int $positionLimitGoogle = null,
        public readonly ?bool $subdomains = null,
        public readonly ?array $schedule = null,
        public readonly ?bool $wordstatEnabled = null,
        public readonly ?int $wordstatRegion = null,
        public readonly ?array $wordstatOptions = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        $targets = null;
        if (isset($data['targets']) && is_array($data['targets'])) {
            $targets = array_map(function($target) {
                $domain = null;
                if (isset($target['domain'])) {
                    if (is_array($target['domain']) && !empty($target['domain'])) {
                        if ($target['search_engine'] === 'google') {
                            $domain = $target['domain']['value'] ?? $target['domain']['canonical_name'] ?? $target['domain']['name'] ?? null;
                        } else {
                            $domain = $target['domain']['name'] ?? $target['domain']['canonical_name'] ?? null;
                        }
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
                
                $organic = isset($target['organic']) ? (bool)$target['organic'] : true;
                $enabled = isset($target['enabled']) ? (bool)$target['enabled'] : true;
                
                return [
                    'id' => $target['id'] ?? null,
                    'search_engine' => $target['search_engine'],
                    'domain' => $domain,
                    'region' => $region,
                    'language' => $language,
                    'lr' => $lr,
                    'device' => $device,
                    'os' => $os,
                    'organic' => $organic,
                    'enabled' => $enabled,
                ];
            }, $data['targets']);
        }

        return new self(
            name: $data['name'] ?? null,
            searchEngines: $data['search_engines'] ?? null,
            regions: $data['regions'] ?? null,
            deviceSettings: $data['device_settings'] ?? null,
            targets: $targets,
            keywordGroups: $data['keyword_groups'] ?? null,
            positionLimitYandex: $data['position_limit_yandex'] ?? null,
            positionLimitGoogle: $data['position_limit_google'] ?? null,
            subdomains: $data['subdomains'] ?? null,
            schedule: $data['schedule'] ?? null,
            wordstatEnabled: $data['wordstat_enabled'] ?? null,
            wordstatRegion: $data['wordstat_region'] ?? null,
            wordstatOptions: $data['wordstat_options'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'search_engines' => $this->searchEngines,
            'regions' => $this->regions,
            'device_settings' => $this->deviceSettings,
            'keyword_groups' => $this->keywordGroups,
            'position_limit_yandex' => $this->positionLimitYandex,
            'position_limit_google' => $this->positionLimitGoogle,
            'subdomains' => $this->subdomains,
            'schedule' => $this->schedule,
            'wordstat_enabled' => $this->wordstatEnabled,
            'wordstat_region' => $this->wordstatRegion,
            'wordstat_options' => $this->wordstatOptions,
        ], fn($value) => $value !== null);
    }
}
