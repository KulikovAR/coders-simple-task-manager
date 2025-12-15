<?php

namespace App\Http\Controllers;

use App\Services\Seo\Services\UserXmlApiSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserXmlApiSettingsController extends Controller
{
    public function __construct(
        private UserXmlApiSettingsService $xmlApiSettingsService
    )
    {
    }

    public function getSettings(): JsonResponse
    {
        $googleApi = $this->xmlApiSettingsService->getGoogleApiData();
        $wordstatApi = $this->xmlApiSettingsService->getWordstatApiData();

        return response()->json([
            'success' => true,
            'data' => [
                'google_api' => $googleApi,
                'wordstat_api' => $wordstatApi
            ]
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'google_api.baseUrl' => 'nullable|string|max:255',
            'google_api.userId' => 'nullable|string|max:255',
            'google_api.apiKey' => 'nullable|string|max:255',
            'wordstat_api.baseUrl' => 'nullable|string|max:255',
            'wordstat_api.userId' => 'nullable|string|max:255',
            'wordstat_api.apiKey' => 'nullable|string|max:255',
        ]);

        $googleApi = $request->input('google_api', []);
        $wordstatApi = $request->input('wordstat_api', []);

        $this->xmlApiSettingsService->createOrUpdateSettings([
            'xml_base_url' => $googleApi['baseUrl'] ?? null,
            'xml_user_id' => $googleApi['userId'] ?? null,
            'xml_api_key' => $googleApi['apiKey'] ?? null,
            'xml_wordstat_base_url' => $wordstatApi['baseUrl'] ?? null,
            'xml_wordstat_user_id' => $wordstatApi['userId'] ?? null,
            'xml_wordstat_api_key' => $wordstatApi['apiKey'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Настройки XML API сохранены'
        ]);
    }
}
