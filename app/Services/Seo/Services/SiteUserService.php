<?php

namespace App\Services\Seo\Services;

use App\Models\SeoSiteUser;
use App\Services\Seo\DTOs\SiteDTO;
use App\Services\Seo\DTOs\UpdateSiteDTO;
use Illuminate\Support\Facades\Auth;

class SiteUserService
{
    public function __construct(
        private SiteService $siteService,
        private MicroserviceClient $microserviceClient
    ) {}

    public function getUserSites(): array
    {
        $userSites = SeoSiteUser::where('user_id', Auth::id())
            ->pluck('go_seo_site_id')
            ->toArray();

        return $this->siteService->getUserData($userSites);
    }

    public function createSiteForUser(string $domain, string $name, array $siteData = []): ?SiteDTO
    {
        $site = $this->siteService->createSite($domain, $name);

        if (!$site) {
            return null;
        }

        SeoSiteUser::create([
            'user_id' => Auth::id(),
            'go_seo_site_id' => $site->id,
        ]);

        if (!empty($siteData)) {
            $dto = UpdateSiteDTO::fromRequest($siteData);
            $this->siteService->updateSite($site->id, $dto);
        }

        return $site;
    }

    public function hasAccessToSite(int $siteId): bool
    {
        return SeoSiteUser::where('user_id', Auth::id())
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

        return [
            'site' => $site->toArray(),
            'keywords' => $keywordsText,
        ];
    }

    public function updateSite(int $siteId, UpdateSiteDTO $dto): bool
    {
        if (!$this->hasAccessToSite($siteId)) {
            return false;
        }

        return $this->siteService->updateSite($siteId, $dto);
    }

    public function deleteSite(int $siteId): bool
    {
        if (!$this->hasAccessToSite($siteId)) {
            return false;
        }

        SeoSiteUser::where('user_id', Auth::id())
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
