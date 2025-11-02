<?php

namespace App\Services\Seo\Services;

use App\Models\Geo;
use Illuminate\Support\Collection;

class GeoService
{
    public function findByCountryCode(string $countryCode): Collection
    {
        return Geo::where('country_code', $countryCode)
            ->where('status', 'Active')
            ->orderBy('name')
            ->get();
    }
    
    public function findByTargetType(string $targetType): Collection
    {
        return Geo::where('target_type', $targetType)
            ->where('status', 'Active')
            ->orderBy('name')
            ->get();
    }
    
    public function findById(int $criteriaId): ?Geo
    {
        return Geo::find($criteriaId);
    }
    
    public function findByParentId(int $parentId): Collection
    {
        return Geo::where('parent_id', $parentId)
            ->where('status', 'Active')
            ->orderBy('name')
            ->get();
    }
    
    public function searchByName(string $query, ?string $countryCode = null): Collection
    {
        $queryBuilder = Geo::where('status', 'Active')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('canonical_name', 'like', "%{$query}%");
            });
        
        if ($countryCode) {
            $queryBuilder->where('country_code', $countryCode);
        }
        
        return $queryBuilder->orderBy('name')->limit(100)->get();
    }
    
    public function getCountries(): Collection
    {
        return Geo::where('target_type', 'Country')
            ->where('status', 'Active')
            ->orderBy('name')
            ->get();
    }
    
    public function getRegionsByCountry(string $countryCode): Collection
    {
        $country = Geo::where('country_code', $countryCode)
            ->where('target_type', 'Country')
            ->where('status', 'Active')
            ->first();
        
        if (!$country) {
            return collect();
        }
        
        return Geo::where('parent_id', $country->criteria_id)
            ->where('status', 'Active')
            ->orderBy('name')
            ->get();
    }
    
    public function findDomainByName(string $name): ?Geo
    {
        return Geo::where('target_type', 'Country')
            ->where('status', 'Active')
            ->where(function ($q) use ($name) {
                $q->where('name', $name)
                  ->orWhere('canonical_name', $name);
            })
            ->first();
    }
    
    public function findRegionByNameAndDomain(string $regionName, int $domainCriteriaId): ?Geo
    {
        return Geo::where('parent_id', $domainCriteriaId)
            ->where('status', 'Active')
            ->where(function ($q) use ($regionName) {
                $q->where('name', $regionName)
                  ->orWhere('canonical_name', $regionName);
            })
            ->first();
    }

    public function getAllRegions(?string $query = null): Collection
    {
        $queryBuilder = Geo::where('target_type', 'Region')
            ->where('status', 'Active');

        if ($query) {
            $queryBuilder->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('canonical_name', 'like', "%{$query}%");
            });
        }

        return $queryBuilder->orderBy('name')->limit(100)->get();
    }
}
