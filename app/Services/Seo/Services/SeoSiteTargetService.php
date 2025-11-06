<?php

namespace App\Services\Seo\Services;

use App\Models\SeoSiteTarget;
use Illuminate\Support\Collection;

class SeoSiteTargetService
{
    public function listForSite(int $seoSiteId): Collection
    {
        return SeoSiteTarget::where('seo_site_id', $seoSiteId)
            ->orderBy('id')
            ->get();
    }

    public function upsertTargets(int $seoSiteId, array $targets): void
    {
        $idsToKeep = [];
        foreach ($targets as $t) {
            $target = SeoSiteTarget::create([
                'seo_site_id' => $seoSiteId,
                'search_engine' => $t['search_engine'],
                'domain' => $t['domain'] ?? null,
                'region' => $t['region'] ?? null,
                'language' => $t['language'] ?? null,
                'lr' => $t['lr'] ?? null,
                'device' => $t['device'],
                'os' => $t['os'] ?? null,
                'organic' => $t['organic'] ?? true,
            ]);
            $idsToKeep[] = $target->id;
        }

        SeoSiteTarget::where('seo_site_id', $seoSiteId)
            ->whereNotIn('id', $idsToKeep)
            ->delete();
    }
}
