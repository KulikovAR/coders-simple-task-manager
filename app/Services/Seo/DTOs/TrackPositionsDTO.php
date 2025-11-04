<?php

namespace App\Services\Seo\DTOs;

class TrackPositionsDTO
{
    public function __construct(
        public readonly int $siteId,
        public readonly ?string $device,
        public readonly string $source,
        public readonly ?string $country = null,
        public readonly ?string $lang = null,
        public readonly ?string $os = null,
        public readonly bool $ads = false,
        public readonly int $pages = 1,
        public readonly ?bool $subdomains = null,
        public readonly ?string $xmlApiKey = null,
        public readonly ?string $xmlBaseUrl = null,
        public readonly ?string $xmlUserId = null,
        public readonly ?int $lr = null,
        public readonly ?int $regions = null,
        public readonly ?int $domain = null,
        public readonly ?bool $default = null,
        public readonly ?bool $quotes = null,
        public readonly ?bool $quotesExclamationMarks = null,
        public readonly ?bool $exclamationMarks = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            siteId: $data['site_id'],
            device: $data['device'] ?? null,
            source: $data['source'],
            country: $data['country'] ?? null,
            lang: $data['lang'] ?? null,
            os: $data['os'] ?? null,
            ads: $data['ads'] ?? false,
            pages: $data['pages'] ?? 1,
            subdomains: $data['subdomains'] ?? null,
            xmlApiKey: $data['xml_api_key'] ?? null,
            xmlBaseUrl: $data['xml_base_url'] ?? null,
            xmlUserId: $data['xml_user_id'] ?? null,
            lr: $data['lr'] ?? null,
            regions: $data['regions'] ?? null,
            domain: $data['domain'] ?? null,
            default: $data['default'] ?? null,
            quotes: $data['quotes'] ?? null,
            quotesExclamationMarks: $data['quotes_exclamation_marks'] ?? null,
            exclamationMarks: $data['exclamation_marks'] ?? null
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
            'xml_api_key' => $this->xmlApiKey,
            'xml_base_url' => $this->xmlBaseUrl,
            'xml_user_id' => $this->xmlUserId,
            'lr' => $this->lr,
            'regions' => $this->regions,
            'domain' => $this->domain,
            'default' => $this->default,
            'quotes' => $this->quotes,
            'quotes_exclamation_marks' => $this->quotesExclamationMarks,
            'exclamation_marks' => $this->exclamationMarks,
        ], fn($value) => $value !== null);
    }

    public function getDeviceOptions(): array
    {
        return ['desktop', 'tablet', 'mobile'];
    }

    public function getSourceOptions(): array
    {
        return ['google', 'yandex', 'wordstat'];
    }

    public function getOsOptions(): array
    {
        return ['ios', 'android'];
    }
}
