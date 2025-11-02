<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\DTOs\SiteDTO;
use App\Services\Seo\DTOs\UpdateSiteDTO;
use App\Models\SeoSite;

class SiteService
{
    public function __construct(
        private MicroserviceClient $microserviceClient,
        private SeoSiteTargetService $targetService
    ) {}

    public function findByMicroserviceId(int $microserviceId): ?SiteDTO
    {
        $site = SeoSite::where('go_seo_site_id', $microserviceId)->first();
        
        return $site ? SiteDTO::fromLocal($site->toArray()) : null;
    }

    public function create(int $microserviceId, string $name, ?int $userId = null): SiteDTO
    {
        $site = SeoSite::create([
            'go_seo_site_id' => $microserviceId,
            'user_id' => $userId,
            'name' => $name,
            'search_engines' => [],
            'regions' => [],
            'device_settings' => [],
        ]);

        return SiteDTO::fromLocal($site->toArray());
    }

    public function update(int $microserviceId, UpdateSiteDTO $dto): bool
    {
        $site = SeoSite::where('go_seo_site_id', $microserviceId)->first();
        
        if (!$site) {
            return false;
        }

        $updateData = [];
        
        if ($dto->name !== null) {
            $updateData['name'] = $dto->name;
        }
        if ($dto->searchEngines !== null) {
            $updateData['search_engines'] = $dto->searchEngines;
        }
        if ($dto->regions !== null) {
            $updateData['regions'] = $dto->regions;
        }
        if ($dto->deviceSettings !== null) {
            $updateData['device_settings'] = $dto->deviceSettings;
        }
        if ($dto->positionLimit !== null) {
            $updateData['position_limit'] = $dto->positionLimit;
        }
        if ($dto->subdomains !== null) {
            $updateData['subdomains'] = $dto->subdomains;
        }
        if ($dto->schedule !== null) {
            $updateData['schedule'] = $dto->schedule;
        }
        if ($dto->wordstatEnabled !== null) {
            $updateData['wordstat_enabled'] = $dto->wordstatEnabled;
        }
        if ($dto->wordstatRegion !== null) {
            $updateData['wordstat_region'] = $dto->wordstatRegion;
        }

        $updated = $site->update($updateData);

        if ($dto->targets !== null) {
            $this->targetService->upsertTargets($site->id, $dto->targets);
        }

        return $updated;
    }

    public function getSite(int $siteId): ?SiteDTO
    {
        $localData = $this->findByMicroserviceId($siteId);

        if (!$localData) {
            return null;
        }

        $microserviceData = $this->microserviceClient->getById($siteId);

        if ($microserviceData) {
            $microserviceDTO = SiteDTO::fromMicroservice($microserviceData);
            return $microserviceDTO->mergeWith($localData);
        }

        return $localData;
    }

    public function createSite(string $domain, string $name, ?int $userId = null): ?SiteDTO
    {
        $data = $this->microserviceClient->createSite($domain);

        if ($data && isset($data['id'])) {
            $this->create($data['id'], $name, $userId);
            return SiteDTO::fromMicroservice($data);
        }

        return null;
    }

    public function updateSite(int $siteId, UpdateSiteDTO $dto): bool
    {
        $success = $this->update($siteId, $dto);

        if (!empty($dto->keywords)) {
            $this->updateSiteKeywords($siteId, $dto->keywords);
        }

        return $success;
    }

    public function updateSiteKeywords(int $siteId, string $keywords): void
    {
        $existingKeywords = $this->microserviceClient->getKeywords($siteId);
        $existingValues = array_column($existingKeywords, 'value');

        $newKeywords = array_unique(array_filter(array_map('trim', explode("\n", $keywords))));

        foreach ($existingKeywords as $keyword) {
            if (!in_array($keyword['value'], $newKeywords, true)) {
                $this->microserviceClient->deleteKeyword($keyword['id']);
            }
        }

        foreach ($newKeywords as $keywordValue) {
            if (!empty($keywordValue) && !in_array($keywordValue, $existingValues)) {
                $this->microserviceClient->createKeyword($siteId, $keywordValue);
            }
        }
    }

    public function mergeWithMicroserviceData(SiteDTO $microserviceData): SiteDTO
    {
        $localData = $this->findByMicroserviceId($microserviceData->id);
        
        return $localData ? $microserviceData->mergeWith($localData) : $microserviceData;
    }

    public function mergeSitesWithLocalData(array $microserviceSites): array
    {
        return array_map(function ($siteData) {
            $siteDTO = SiteDTO::fromMicroservice($siteData);
            return $this->mergeWithMicroserviceData($siteDTO)->toArray();
        }, $microserviceSites);
    }

    public function getUserData(array $userSites): array
    {
        $sites = [];

        if (empty($userSites)) {
            return ['sites' => []];
        }

        try {
            $sites = $this->microserviceClient->getByIds($userSites);
            if (is_array($sites)) {
                $sites = $this->mergeSitesWithLocalData($sites);
            }
        } catch (\Exception $e) {
            // Silent fail
        }

        return [
            'sites' => array_values($sites),
        ];
    }
}
