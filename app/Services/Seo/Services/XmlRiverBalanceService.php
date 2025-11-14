<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\Contracts\ApiBalanceServiceInterface;
use App\Services\Seo\Services\XmlRiverTariffService;

class XmlRiverBalanceService implements ApiBalanceServiceInterface
{
    private XmlRiverTariffService $tariffService;

    public function __construct(XmlRiverTariffService $tariffService)
    {
        $this->tariffService = $tariffService;
    }

    public function getBalance(): ?array
    {
        if (!$this->isConfigured()) {
            return null;
        }

        $balance = $this->tariffService->getBalance();
        
        if ($balance === null) {
            return null;
        }

        return [
            'provider' => 'xmlriver',
            'balance' => $balance,
            'balance_freeze' => 0,
            'balance_earned' => 0,
            'google_queries' => 0,
            'yandex_live_queries' => 0,
            'yandex_live_turbo_queries' => 0,
            'yandex_xml_queries' => 0,
            'google_load' => 0,
            'yandex_live_load' => 0,
        ];
    }

    public function isConfigured(): bool
    {
        return $this->tariffService->isConfigured();
    }
}
