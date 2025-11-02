<?php

namespace App\Services\Seo\Services;

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
        $keywordsText = implode("\n", array_column($keywords, 'value'));

        $localSite = SeoSite::where('go_seo_site_id', $siteId)->first();
        if (!$localSite) {
            return null;
        }

        $siteData = $site->toArray();
        $targets = $this->targetService->listForSite($localSite->id);
        $siteData['targets'] = $targets->map(function($target) {
            $targetData = [
                'search_engine' => $target->search_engine,
                'device' => $target->device ?? ($target->search_engine === 'yandex' ? 'mobile' : 'desktop'),
                'os' => $target->os,
            ];
            
            if ($target->search_engine === 'google') {
                $domainObj = null;
                if ($target->domain) {
                    $domain = $this->geoService->findDomainByName($target->domain);
                    if ($domain) {
                        $domainObj = [
                            'criteria_id' => $domain->criteria_id,
                            'name' => $domain->name,
                            'canonical_name' => $domain->canonical_name,
                            'country_code' => $domain->country_code,
                        ];
                    } else {
                        $domainObj = ['name' => $target->domain];
                    }
                }
                
                $regionObj = null;
                if ($target->region && $domainObj && isset($domainObj['criteria_id'])) {
                    $region = $this->geoService->findRegionByNameAndDomain($target->region, $domainObj['criteria_id']);
                    if ($region) {
                        $regionObj = [
                            'criteria_id' => $region->criteria_id,
                            'name' => $region->name,
                            'canonical_name' => $region->canonical_name,
                        ];
                    } else {
                        $regionObj = ['name' => $target->region];
                    }
                } elseif ($target->region) {
                    $regionObj = ['name' => $target->region];
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
            'keywords' => $keywordsText,
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
