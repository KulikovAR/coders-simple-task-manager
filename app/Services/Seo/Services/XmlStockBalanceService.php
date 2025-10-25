<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\Contracts\ApiBalanceServiceInterface;
use App\Services\Seo\Services\UserXmlApiSettingsService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XmlStockBalanceService implements ApiBalanceServiceInterface
{
    private UserXmlApiSettingsService $xmlApiSettingsService;

    public function __construct(UserXmlApiSettingsService $xmlApiSettingsService)
    {
        $this->xmlApiSettingsService = $xmlApiSettingsService;
    }

    public function getBalance(): ?array
    {
        $apiData = $this->xmlApiSettingsService->getGoogleApiData();
        
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $url = "https://xmlstock.com/api?user={$apiData['userId']}&key={$apiData['apiKey']}";
            
            $response = Http::timeout(10)->get($url);
            
            if (!$response->successful()) {
                Log::warning('XmlStock API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $data = $response->json();
            
            if (!$data || !isset($data['balance'])) {
                Log::warning('XmlStock API returned invalid data', ['data' => $data]);
                return null;
            }

            return [
                'provider' => 'xmlstock',
                'balance' => $data['balance'] ?? 0,
                'balance_freeze' => $data['balance-freeze'] ?? 0,
                'balance_earned' => $data['balance-earned'] ?? 0,
                'google_queries' => $data['google-queries'] ?? 0,
                'yandex_live_queries' => $data['yandex-live-queries'] ?? 0,
                'yandex_live_turbo_queries' => $data['yandex-live-turbo-queries'] ?? 0,
                'yandex_xml_queries' => $data['yandex-xml-queries'] ?? 0,
                'google_load' => $data['google-load'] ?? 0,
                'yandex_live_load' => $data['yandex-live-load'] ?? 0,
            ];
            
        } catch (\Exception $e) {
            Log::error('XmlStock balance fetch error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function isConfigured(): bool
    {
        $apiData = $this->xmlApiSettingsService->getGoogleApiData();
        
        return !empty($apiData['userId']) && !empty($apiData['apiKey']);
    }
}
