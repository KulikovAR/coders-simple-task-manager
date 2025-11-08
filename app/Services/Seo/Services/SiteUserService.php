<?php

namespace App\Services\Seo\Services;

use App\Enums\GoogleDomainType;
use App\Models\SeoSite;
use App\Services\Seo\DTOs\SiteDTO;
use App\Services\Seo\DTOs\UpdateSiteDTO;
use App\Services\Seo\Services\WordstatRecognitionTaskService;
use App\Services\Seo\Services\SeoSiteTargetService;
use App\Services\Seo\Services\GeoService;
use Illuminate\Support\Facades\Auth;

class SiteUserService
{
    public function __construct(
        private SiteService $siteService,
        private MicroserviceClient $microserviceClient,
        private WordstatRecognitionTaskService $wordstatRecognitionTaskService,
        private SeoSiteTargetService $targetService,
        private GeoService $geoService
    ) {}

    public function getUserSites(): array
    {
        $userSites = SeoSite::where('user_id', Auth::id())
            ->pluck('go_seo_site_id')
            ->toArray();

        return $this->siteService->getUserData($userSites);
    }

    public function createSiteForUser(string $domain, string $name, array $siteData = []): ?SiteDTO
    {
        $site = $this->siteService->createSite($domain, $name, Auth::id());

        if (!$site) {
            return null;
        }

        if (!empty($siteData)) {
            $dto = UpdateSiteDTO::fromRequest($siteData);
            $this->siteService->updateSite($site->id, $dto);
        }

        return $site;
    }

    public function hasAccessToSite(int $siteId): bool
    {
        return SeoSite::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->exists();
    }

    public function getSiteData(int $siteId): ?array
    {
        if (!$this->hasAccessToSite($siteId)) {
            return null;
        }

        $site = $this->siteService->getSite($siteId);

        if (!$site) {
            return null;
        }

        $keywords = $this->microserviceClient->getKeywords($siteId);
        $groups = $this->microserviceClient->getGroups($siteId);
        $groupIdToName = [];
        foreach (($groups ?? []) as $g) {
            if (isset($g['id'])) {
                $groupIdToName[$g['id']] = $g['name'] ?? '';
            }
        }

        $keywordGroupsMap = [];
        foreach (($keywords ?? []) as $kw) {
            $gid = $kw['group_id'] ?? null;
            $key = $gid !== null ? (string)$gid : 'default';
            if (!isset($keywordGroupsMap[$key])) {
                $keywordGroupsMap[$key] = [
                    'name' => $gid !== null ? ($groupIdToName[$gid] ?? '') : '',
                    'keywords' => [],
                ];
            }
            if (!empty($kw['value'])) {
                $keywordGroupsMap[$key]['keywords'][] = $kw['value'];
            }
        }

        $keywordGroups = array_map(function ($item) {
            return [
                'name' => $item['name'],
                'keywords' => implode("\n", $item['keywords']),
            ];
        }, array_values($keywordGroupsMap));

        $localSite = SeoSite::where('go_seo_site_id', $siteId)->first();
        if (!$localSite) {
            return null;
        }

        $siteData = $site->toArray();
        $targets = $this->targetService->listForSite($localSite->id);
        $siteData['targets'] = $targets->map(function($target) {
            $targetData = [
                'id' => $target->id,
                'search_engine' => $target->search_engine,
                'device' => $target->device ?? 'desktop',
                'os' => $target->os,
                'organic' => $target->organic ?? true,
                'enabled' => $target->enabled ?? true,
            ];
            
            if ($target->search_engine === 'google') {
                $domainObj = null;
                if ($target->domain) {
                    $googleDomain = GoogleDomainType::tryFrom($target->domain);
                    if ($googleDomain) {
                        $domainObj = [
                            'value' => $googleDomain->value,
                            'name' => $googleDomain->label(),
                            'canonical_name' => $googleDomain->value,
                        ];
                    } else {
                        $domainObj = [
                            'value' => $target->domain,
                            'name' => $target->domain,
                            'canonical_name' => $target->domain,
                        ];
                    }
                }
                
                $regionObj = null;
                if ($target->region) {
                    $regions = $this->geoService->getAllRegions($target->region);
                    $region = $regions->firstWhere('name', $target->region) 
                        ?? $regions->firstWhere('canonical_name', $target->region);
                    
                    if ($region) {
                        $regionObj = [
                            'criteria_id' => $region->criteria_id,
                            'name' => $region->name,
                            'canonical_name' => $region->canonical_name,
                        ];
                    } else {
                        $regionObj = ['name' => $target->region];
                    }
                }
                
                $targetData['domain'] = $domainObj;
                $targetData['region'] = $regionObj;
                $targetData['language'] = $target->language;
            } else {
                $targetData['lr'] = $target->lr;
            }
            
            return $targetData;
        })->toArray();

        return [
            'site' => $siteData,
            'keyword_groups' => $keywordGroups,
        ];
    }

    public function updateSite(int $siteId, UpdateSiteDTO $dto): bool
    {
        if (!$this->hasAccessToSite($siteId)) {
            return false;
        }

        $success = $this->siteService->updateSite($siteId, $dto);

        return $success;
    }

    public function deleteSite(int $siteId): bool
    {
        if (!$this->hasAccessToSite($siteId)) {
            return false;
        }

        SeoSite::where('user_id', Auth::id())
            ->where('go_seo_site_id', $siteId)
            ->delete();

        return true;
    }

    public function getSite(int $siteId): ?SiteDTO
    {
        if (!$this->hasAccessToSite($siteId)) {
            return null;
        }

        return $this->siteService->getSite($siteId);
    }

    public function getUserData(array $userSites): array
    {
        return $this->siteService->getUserData($userSites);
    }
}
