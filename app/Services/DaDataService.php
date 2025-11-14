<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DaDataService
{
    private string $token;
    private string $url;

    public function __construct()
    {
        $this->token = config('services.dadata.token');
        $this->url = config('services.dadata.url');
    }

    /**
     * Поиск стран по запросу
     *
     * @param string $query
     * @return array
     */
    public function searchCountries(string $query): array
    {
        if (empty($this->token)) {
            Log::warning('DaData token is not configured');
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'Authorization' => 'Token ' . $this->token,
            ])->timeout(10)->post($this->url, [
                'query' => $query
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatCountries($data['suggestions'] ?? []);
            }

            Log::error('DaData API error: ' . $response->body());
            return [];

        } catch (\Exception $e) {
            Log::error('DaData service error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Форматирование данных стран для фронтенда
     *
     * @param array $suggestions
     * @return array
     */
    private function formatCountries(array $suggestions): array
    {
        return array_map(function ($suggestion) {
            $data = $suggestion['data'] ?? [];
            return [
                'value' => $data['alfa2'] ?? $suggestion['value'],
                'label' => $suggestion['value'],
                'code' => $data['code'] ?? null,
                'alfa2' => $data['alfa2'] ?? null,
                'alfa3' => $data['alfa3'] ?? null,
                'nameShort' => $data['name_short'] ?? null,
                'name' => $data['name'] ?? null,
            ];
        }, $suggestions);
    }

    /**
     * Получить популярные страны (для начального списка)
     *
     * @return array
     */
    public function getPopularCountries(): array
    {
        $popularCountries = [
            'Россия', 'США', 'Германия', 'Франция', 'Великобритания', 
            'Испания', 'Италия', 'Канада', 'Австралия', 'Япония',
            'Китай', 'Бразилия', 'Индия', 'Украина', 'Беларусь', 'Казахстан'
        ];

        $results = [];
        foreach ($popularCountries as $country) {
            $searchResults = $this->searchCountries($country);
            if (!empty($searchResults)) {
                $results[] = $searchResults[0];
            }
        }

        return $results;
    }
}
