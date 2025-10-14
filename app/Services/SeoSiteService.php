<?php

namespace App\Services;

use App\DTOs\SiteDTO;
use App\DTOs\UpdateSiteDTO;
use App\Models\SeoSite;

class SeoSiteService
{
    public function findByMicroserviceId(int $microserviceId): ?SiteDTO
    {
        $site = SeoSite::where('go_seo_site_id', $microserviceId)->first();
        
        return $site ? SiteDTO::fromLocal($site->toArray()) : null;
    }

    public function create(int $microserviceId, string $name): SiteDTO
    {
        $site = SeoSite::create([
            'go_seo_site_id' => $microserviceId,
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

        return $site->update($updateData);
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
}