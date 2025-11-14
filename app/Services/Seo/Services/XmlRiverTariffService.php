<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\Services\UserXmlApiSettingsService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XmlRiverTariffService
{
    private UserXmlApiSettingsService $xmlApiSettingsService;

    public function __construct(UserXmlApiSettingsService $xmlApiSettingsService)
    {
        $this->xmlApiSettingsService = $xmlApiSettingsService;
    }

    public function getBalance(): ?float
    {
        $apiData = $this->xmlApiSettingsService->getWordstatApiData();
        
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $url = "https://xmlriver.com/api/get_balance/?user={$apiData['userId']}&key={$apiData['apiKey']}";
            
            $response = Http::timeout(10)->get($url);
            
            if (!$response->successful()) {
                Log::warning('XmlRiver balance API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $balance = trim($response->body());
            
            if (!is_numeric($balance)) {
                Log::warning('XmlRiver balance API returned non-numeric value', ['balance' => $balance]);
                return null;
            }

            return (float) $balance;
            
        } catch (\Exception $e) {
            Log::error('XmlRiver balance fetch error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function getWordstatCost(): ?float
    {
        $apiData = $this->xmlApiSettingsService->getWordstatApiData();
        
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $url = "https://xmlriver.com/api/get_cost/wordstat/?user={$apiData['userId']}&key={$apiData['apiKey']}";
            
            $response = Http::timeout(10)->get($url);
            
            if (!$response->successful()) {
                Log::warning('XmlRiver wordstat cost API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $cost = trim($response->body());
            
            if (!is_numeric($cost)) {
                Log::warning('XmlRiver wordstat cost API returned non-numeric value', ['cost' => $cost]);
                return null;
            }

            return (float) $cost;
            
        } catch (\Exception $e) {
            Log::error('XmlRiver wordstat cost fetch error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function isConfigured(): bool
    {
        $apiData = $this->xmlApiSettingsService->getWordstatApiData();
        
        return !empty($apiData['userId']) && !empty($apiData['apiKey']);
    }
}
