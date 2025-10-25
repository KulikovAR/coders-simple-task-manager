<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\Services\XmlRiverTariffService;

class WordstatCostCalculator
{
    private XmlRiverTariffService $tariffService;

    public function __construct(XmlRiverTariffService $tariffService)
    {
        $this->tariffService = $tariffService;
    }

    public function calculateWordstatCost(int $keywordsCount): array
    {
        if (!$this->tariffService->isConfigured()) {
            return [
                'success' => false,
                'error' => 'API настройки xmlriver не заполнены',
                'cost' => 0
            ];
        }

        $pricePer1000 = $this->tariffService->getWordstatCost();
        
        if ($pricePer1000 === null) {
            return [
                'success' => false,
                'error' => 'Не удалось получить цену за 1000 запросов',
                'cost' => 0
            ];
        }

        $totalCost = $this->calculateCost($keywordsCount, $pricePer1000);
        $balance = $this->tariffService->getBalance();
        $hasEnoughBalance = $balance !== null && $balance >= $totalCost;

        return [
            'success' => true,
            'total_cost' => $totalCost,
            'price_per_1000' => $pricePer1000,
            'keywords_count' => $keywordsCount,
            'total_requests' => $keywordsCount,
            'balance' => $balance,
            'has_enough_balance' => $hasEnoughBalance,
            'provider' => 'xmlriver'
        ];
    }

    private function calculateCost(int $keywordsCount, float $pricePer1000): float
    {
        $costPerRequest = $pricePer1000 / 1000;
        return $keywordsCount * $costPerRequest;
    }

    public function validateWordstatRequest(int $keywordsCount): array
    {
        $costCalculation = $this->calculateWordstatCost($keywordsCount);
        
        if (!$costCalculation['success']) {
            return [
                'valid' => false,
                'errors' => [$costCalculation['error']]
            ];
        }

        if (!$costCalculation['has_enough_balance']) {
            return [
                'valid' => false,
                'errors' => [
                    'Недостаточно средств на балансе xmlriver. Требуется: ' . 
                    number_format($costCalculation['total_cost'], 2) . 
                    ' руб., доступно: ' . 
                    number_format($costCalculation['balance'], 2) . ' руб.'
                ]
            ];
        }

        return [
            'valid' => true,
            'cost_calculation' => $costCalculation
        ];
    }
}
