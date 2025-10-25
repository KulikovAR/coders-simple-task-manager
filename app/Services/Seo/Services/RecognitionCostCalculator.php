<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\Services\XmlStockTariffService;

class RecognitionCostCalculator
{
    private XmlStockTariffService $tariffService;

    public function __construct(XmlStockTariffService $tariffService)
    {
        $this->tariffService = $tariffService;
    }

    public function calculateRecognitionCost(
        int $keywordsCount,
        int $pagesPerKeyword = 10,
        array $searchEngines = ['yandex', 'google']
    ): array {
        if (!$this->tariffService->isConfigured()) {
            return [
                'success' => false,
                'error' => 'API настройки не заполнены',
                'cost' => 0
            ];
        }

        $totalCost = 0;
        $costBreakdown = [];
        $errors = [];

        foreach ($searchEngines as $engine) {
            $price = $this->getEnginePrice($engine);

            if ($price === null) {
                $errors[] = "Не удалось получить цену для {$engine}";
                continue;
            }

            $engineCost = $this->calculateEngineCost($keywordsCount, $pagesPerKeyword, $price);
            $totalCost += $engineCost;

            $costBreakdown[$engine] = [
                'price_per_1000' => $price,
                'keywords' => $keywordsCount,
                'pages_per_keyword' => $pagesPerKeyword,
                'positions_per_page' => 10,
                'total_requests' => $keywordsCount * $pagesPerKeyword * 10,
                'cost' => $engineCost
            ];
        }

        $balance = $this->tariffService->getBalance();
        $hasEnoughBalance = $balance !== null && $balance >= $totalCost;

        return [
            'success' => empty($errors),
            'errors' => $errors,
            'total_cost' => $totalCost,
            'cost_breakdown' => $costBreakdown,
            'balance' => $balance,
            'has_enough_balance' => $hasEnoughBalance,
            'keywords_count' => $keywordsCount,
            'pages_per_keyword' => $pagesPerKeyword,
            'search_engines' => $searchEngines
        ];
    }

    private function getEnginePrice(string $engine): ?float
    {
        return match ($engine) {
            'yandex' => $this->tariffService->getYandexPrice(),
            'google' => $this->tariffService->getGooglePrice(),
            'yandexlive' => $this->tariffService->getYandexLivePrice(),
            default => null
        };
    }

    private function calculateEngineCost(int $keywordsCount, int $pagesPerKeyword, float $pricePer1000): float
    {
        $totalRequests = $keywordsCount * $pagesPerKeyword;
        $costPerRequest = $pricePer1000 / 1000;

        return $totalRequests * $costPerRequest;
    }

    public function validateRecognitionRequest(
        int $keywordsCount,
        int $pagesPerKeyword = 10,
        array $searchEngines = ['yandex', 'google']
    ): array {
        $costCalculation = $this->calculateRecognitionCost($keywordsCount, $pagesPerKeyword, $searchEngines);

        if (!$costCalculation['success']) {
            return [
                'valid' => false,
                'errors' => $costCalculation['errors']
            ];
        }

        if (!$costCalculation['has_enough_balance']) {
            return [
                'valid' => false,
                'errors' => [
                    'Недостаточно средств на балансе. Требуется: ' .
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
