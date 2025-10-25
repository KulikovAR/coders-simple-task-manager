<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\Services\UserXmlApiSettingsService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XmlStockTariffService
{
    private UserXmlApiSettingsService $xmlApiSettingsService;

    public function __construct(UserXmlApiSettingsService $xmlApiSettingsService)
    {
        $this->xmlApiSettingsService = $xmlApiSettingsService;
    }

    public function getTariffInfo(): ?array
    {
        $apiData = $this->xmlApiSettingsService->getGoogleApiData();
        
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $url = "https://xmlstock.com/api/?user={$apiData['userId']}&key={$apiData['apiKey']}&info=user";
            
            $response = Http::timeout(10)->get($url);
            
            if (!$response->successful()) {
                Log::warning('XmlStock tariff API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $data = $response->json();
            
            if (!$data || $data['status'] !== 'ok') {
                Log::warning('XmlStock tariff API returned invalid data', ['data' => $data]);
                return null;
            }

            return $data;
            
        } catch (\Exception $e) {
            Log::error('XmlStock tariff fetch error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function getYandexPrice(): ?float
    {
        $tariffInfo = $this->getTariffInfo();
        
        if (!$tariffInfo || !isset($tariffInfo['urls']['yandex']['price'])) {
            return null;
        }

        return (float) $tariffInfo['urls']['yandex']['price'];
    }

    public function getGooglePrice(): ?float
    {
        $tariffInfo = $this->getTariffInfo();
        
        if (!$tariffInfo || !isset($tariffInfo['urls']['google']['price'])) {
            return null;
        }

        return (float) $tariffInfo['urls']['google']['price'];
    }

    public function getYandexLivePrice(): ?float
    {
        $tariffInfo = $this->getTariffInfo();
        
        if (!$tariffInfo || !isset($tariffInfo['urls']['yandexlive']['price'])) {
            return null;
        }

        return (float) $tariffInfo['urls']['yandexlive']['price'];
    }

    public function isConfigured(): bool
    {
        $apiData = $this->xmlApiSettingsService->getGoogleApiData();
        
        return !empty($apiData['userId']) && !empty($apiData['apiKey']);
    }

    public function getBalance(): ?float
    {
        $balanceService = new XmlStockBalanceService($this->xmlApiSettingsService);
        $balanceData = $balanceService->getBalance();
        
        return $balanceData ? $balanceData['balance'] : null;
    }
}
