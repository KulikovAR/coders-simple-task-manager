<?php

namespace App\Http\Controllers;

use App\Enums\GoogleDomainType;
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

    public function getGoogleDomains(Request $request): JsonResponse
    {
        $query = $request->input('query', '');
        
        $domains = GoogleDomainType::list();
        
        $filtered = [];
        foreach ($domains as $value => $label) {
            if (empty($query) || stripos($value, $query) !== false || stripos($label, $query) !== false) {
                $filtered[] = [
                    'value' => $value,
                    'name' => $label,
                    'canonical_name' => $value,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $filtered
        ]);
    }

    public function getGoogleDomainByValue(Request $request, string $value): JsonResponse
    {
        $domain = GoogleDomainType::tryFrom($value);
        
        if (!$domain) {
            return response()->json([
                'success' => false,
                'message' => 'Domain not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'value' => $domain->value,
                'name' => $domain->label(),
                'canonical_name' => $domain->value,
            ]
        ]);
    }

    public function getAllRegions(Request $request): JsonResponse
    {
        $query = $request->input('query', '');

        $regions = $this->geoService->getAllRegions($query);

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
}

