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

    public function calculateWordstatCost(int $keywordsCount, array $wordstatOptions = null): array
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

        $multiplier = $this->calculateMultiplier($wordstatOptions);
        $totalCost = $this->calculateCost($keywordsCount, $pricePer1000, $multiplier);
        $balance = $this->tariffService->getBalance();
        $hasEnoughBalance = $balance !== null && $balance >= $totalCost;

        return [
            'success' => true,
            'total_cost' => $totalCost,
            'price_per_1000' => $pricePer1000,
            'keywords_count' => $keywordsCount,
            'multiplier' => $multiplier,
            'total_requests' => $keywordsCount * $multiplier,
            'balance' => $balance,
            'has_enough_balance' => $hasEnoughBalance,
            'provider' => 'xmlriver'
        ];
    }

    private function calculateMultiplier(?array $wordstatOptions): int
    {
        if (!$wordstatOptions) {
            return 1;
        }

        $multiplier = 0;
        if ($wordstatOptions['default'] ?? true) {
            $multiplier++;
        }
        if ($wordstatOptions['quotes'] ?? false) {
            $multiplier++;
        }
        if ($wordstatOptions['quotes_exclamation_marks'] ?? false) {
            $multiplier++;
        }
        if ($wordstatOptions['exclamation_marks'] ?? false) {
            $multiplier++;
        }

        return $multiplier > 0 ? $multiplier : 1;
    }

    private function calculateCost(int $keywordsCount, float $pricePer1000, int $multiplier): float
    {
        $costPerRequest = $pricePer1000 / 1000;
        return $keywordsCount * $multiplier * $costPerRequest;
    }

    public function validateWordstatRequest(int $keywordsCount, array $wordstatOptions = null): array
    {
        $costCalculation = $this->calculateWordstatCost($keywordsCount, $wordstatOptions);
        
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
