<?php

namespace App\Http\Controllers;

use App\Services\Seo\Services\GeoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GeoController extends Controller
{
    private GeoService $geoService;

    public function __construct(GeoService $geoService)
    {
        $this->geoService = $geoService;
    }

    public function searchDomains(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string|max:100'
        ]);

        $query = $request->input('query', '');
        
        if (empty($query)) {
            $domains = $this->geoService->getCountries();
        } else {
            $domains = $this->geoService->searchByName($query);
        }

        $result = $domains->map(function ($geo) {
            return [
                'criteria_id' => $geo->criteria_id,
                'name' => $geo->name,
                'canonical_name' => $geo->canonical_name,
                'country_code' => $geo->country_code,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function getRegionsByDomain(Request $request): JsonResponse
    {
        $request->validate([
            'domain_id' => 'required|integer'
        ]);

        $domainId = $request->input('domain_id');
        $domain = $this->geoService->findById($domainId);

        if (!$domain) {
            return response()->json([
                'success' => false,
                'message' => 'Domain not found'
            ], 404);
        }

        $regions = $this->geoService->findByParentId($domainId);

        $result = $regions->map(function ($geo) {
            return [
                'criteria_id' => $geo->criteria_id,
                'name' => $geo->name,
                'canonical_name' => $geo->canonical_name,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function getDomainById(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|integer'
        ]);

        $domain = $this->geoService->findById($request->input('id'));

        if (!$domain) {
            return response()->json([
                'success' => false,
                'message' => 'Domain not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'criteria_id' => $domain->criteria_id,
                'name' => $domain->name,
                'canonical_name' => $domain->canonical_name,
                'country_code' => $domain->country_code,
            ]
        ]);
    }
}

