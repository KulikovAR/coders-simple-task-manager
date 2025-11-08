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
        if ($dto->positionLimitYandex !== null) {
            $updateData['position_limit_yandex'] = $dto->positionLimitYandex;
        }
        if ($dto->positionLimitGoogle !== null) {
            $updateData['position_limit_google'] = $dto->positionLimitGoogle;
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
        if ($dto->wordstatOptions !== null) {
            $updateData['wordstat_options'] = $dto->wordstatOptions;
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

        if (!empty($dto->keywordGroups)) {
            $this->updateSiteKeywords($siteId, $dto->keywordGroups);
        }

        return $success;
    }

    public function updateSiteKeywords(int $siteId, array $keywordGroups = []): void
    {
        $existingKeywords = $this->microserviceClient->getKeywords($siteId);
        $existingGroups = $this->microserviceClient->getGroups($siteId);
        
        $existingKeywordsMap = $this->buildExistingKeywordsMap($existingKeywords);
        $groupKeywordsMap = $this->buildGroupKeywordsMap($existingKeywords);
        
        $newKeywordsMap = $this->buildNewKeywordsMap($siteId, $keywordGroups, $existingGroups, $groupKeywordsMap);
        
        $this->syncKeywords($siteId, $existingKeywordsMap, $newKeywordsMap, $existingKeywords);
        $this->cleanupUnusedGroups($siteId, $keywordGroups, $existingGroups);
    }

    private function buildExistingKeywordsMap(array $keywords): array
    {
        $map = [];
        
        foreach ($keywords as $keyword) {
            $value = trim($keyword['value'] ?? '');
            if (!empty($value)) {
                $map[$value] = $keyword;
            }
        }
        
        return $map;
    }

    private function buildGroupKeywordsMap(array $keywords): array
    {
        $map = [];
        
        foreach ($keywords as $keyword) {
            $groupId = $keyword['group_id'] ?? null;
            $value = trim($keyword['value'] ?? '');
            
            if ($groupId !== null && !empty($value)) {
                if (!isset($map[$groupId])) {
                    $map[$groupId] = [];
                }
                $map[$groupId][] = $value;
            }
        }
        
        foreach ($map as $groupId => $keywordsList) {
            sort($map[$groupId]);
        }
        
        return $map;
    }

    private function buildNewKeywordsMap(int $siteId, array $keywordGroups, array &$existingGroups, array $groupKeywordsMap): array
    {
        $map = [];
        $processed = [];
        
        foreach ($keywordGroups as $group) {
            $newGroupName = $group['name'] ?? null;
            $keywordsList = $this->parseKeywords($group['keywords'] ?? '');
            
            if (empty($keywordsList)) {
                continue;
            }
            
            $groupId = $this->resolveGroupId($siteId, $newGroupName, $existingGroups, $keywordsList, $groupKeywordsMap);
            
            foreach ($keywordsList as $keywordValue) {
                if (isset($processed[$keywordValue])) {
                    continue;
                }
                
                $processed[$keywordValue] = true;
                $map[$keywordValue] = [
                    'group_id' => $groupId,
                    'value' => $keywordValue,
                ];
            }
        }
        
        return $map;
    }

    private function resolveGroupId(int $siteId, ?string $newGroupName, array &$existingGroups, array $keywordsList, array $groupKeywordsMap): ?int
    {
        if (empty($keywordsList)) {
            return null;
        }
        
        $sortedKeywords = $keywordsList;
        sort($sortedKeywords);
        
        $matchedGroupId = null;
        foreach ($groupKeywordsMap as $groupId => $existingKeywords) {
            if ($sortedKeywords === $existingKeywords) {
                $matchedGroupId = $groupId;
                break;
            }
        }
        
        if ($matchedGroupId !== null) {
            $matchedGroup = collect($existingGroups)->firstWhere('id', $matchedGroupId);
            if ($matchedGroup && ($matchedGroup['name'] ?? '') !== ($newGroupName ?? '')) {
                $this->microserviceClient->updateGroup($matchedGroupId, $newGroupName ?? '');
                $matchedGroup['name'] = $newGroupName;
            }
            return $matchedGroupId;
        }
        
        if (!$newGroupName) {
            return null;
        }
        
        $existingGroup = collect($existingGroups)->firstWhere('name', $newGroupName);
        if ($existingGroup) {
            return $existingGroup['id'];
        }
        
        $newGroup = $this->microserviceClient->createGroup($siteId, $newGroupName);
        
        if ($newGroup && isset($newGroup['id'])) {
            $existingGroups[] = $newGroup;
            $groupKeywordsMap[$newGroup['id']] = $sortedKeywords;
            return $newGroup['id'];
        }
        
        return null;
    }

    private function parseKeywords(string $keywords): array
    {
        return array_unique(array_filter(array_map('trim', explode("\n", $keywords))));
    }

    private function syncKeywords(
        int $siteId,
        array $existingKeywordsMap,
        array $newKeywordsMap,
        array $existingKeywords
    ): void {
        foreach ($newKeywordsMap as $keywordValue => $keywordData) {
            $targetGroupId = $keywordData['group_id'];
            
            if (isset($existingKeywordsMap[$keywordValue])) {
                $this->updateKeywordIfNeeded($existingKeywordsMap[$keywordValue], $targetGroupId);
            } else {
                $this->microserviceClient->createKeyword($siteId, $keywordValue, $targetGroupId);
            }
        }
        
        foreach ($existingKeywords as $keyword) {
            $value = trim($keyword['value'] ?? '');
            if (!empty($value) && !isset($newKeywordsMap[$value])) {
                $this->microserviceClient->deleteKeyword($keyword['id']);
            }
        }
    }

    private function updateKeywordIfNeeded(array $existingKeyword, ?int $targetGroupId): void
    {
        $currentGroupId = $existingKeyword['group_id'] ?? null;
        
        if ($currentGroupId != $targetGroupId) {
            $this->microserviceClient->updateKeyword($existingKeyword['id'], $targetGroupId);
        }
    }

    private function cleanupUnusedGroups(int $siteId, array $keywordGroups, array $existingGroups): void
    {
        $keywords = $this->microserviceClient->getKeywords($siteId);
        $usedGroupIds = [];
        
        foreach ($keywords as $keyword) {
            $groupId = $keyword['group_id'] ?? null;
            if ($groupId !== null) {
                $usedGroupIds[$groupId] = true;
            }
        }
        
        foreach ($existingGroups as $group) {
            $groupId = $group['id'] ?? null;
            if ($groupId !== null && !isset($usedGroupIds[$groupId])) {
                $this->microserviceClient->deleteGroup($groupId);
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
