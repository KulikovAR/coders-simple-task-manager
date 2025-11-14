<?php

namespace App\Services\Seo\Services;

class ReportsFiltersService
{
    /**
     * Получить все фильтры из запроса
     */
    public function getRequestFilters(): array
    {
        return [
            'source' => request('source'),
            'date_from' => request('date_from'),
            'date_to' => request('date_to'),
            'rank_from' => request('rank_from'),
            'rank_to' => request('rank_to'),
            'date_sort' => request('date_sort'),
            'sort_type' => request('sort_type'),
            'wordstat_sort' => request('wordstat_sort'),
            'group_id' => request('group_id'),
            'wordstat_query_type' => request('wordstat_query_type'),
            'filter_group_id' => request('filter_group_id'),
        ];
    }

    /**
     * Определить дефолтные фильтры на основе данных сайта
     */
    public function getDefaultFilters(array $site, array $targets = []): array
    {
        $defaults = [];

        // Дефолтная поисковая система
        if (!empty($site['search_engines'])) {
            $defaults['source'] = $site['search_engines'][0];
        }

        // Дефолтные даты
        $defaults['date_from'] = now()->subDays(30)->format('Y-m-d');
        $defaults['date_to'] = now()->addDay()->format('Y-m-d');

        // Дефолтный тип Wordstat
        if ($site['wordstat_enabled'] ?? false) {
            $wordstatOptions = $site['wordstat_options'] ?? ['default' => true];
            $defaults['wordstat_query_type'] = $this->getDefaultWordstatType($wordstatOptions);
        }

        // Дефолтная комбинация для поисковой системы
        $source = $defaults['source'] ?? null;
        if ($source && !empty($targets)) {
            $defaultTargetId = $this->getDefaultTargetId($targets, $source);
            if ($defaultTargetId) {
                $defaults['filter_group_id'] = $defaultTargetId;
            }
        }

        return $defaults;
    }

    /**
     * Применить дефолтные фильтры к запросу
     * Возвращает массив с ключами: 'filters' (примененные фильтры), 'redirect_url' (URL для редиректа, если нужен)
     */
    public function applyDefaultFilters(array $site, array $targets = [], string $routeName, $routeParam): array
    {
        $requestFilters = $this->getRequestFilters();
        $defaultFilters = $this->getDefaultFilters($site, $targets);

        // Определяем, какие дефолтные фильтры нужно применить
        $filtersToApply = [];
        foreach ($defaultFilters as $key => $defaultValue) {
            $requestValue = $requestFilters[$key] ?? null;
            if (empty($requestValue) && !empty($defaultValue)) {
                $filtersToApply[$key] = $defaultValue;
            }
        }

        // Если source был указан в запросе, но filter_group_id нет - определяем дефолтную комбинацию для этого source
        if (!empty($requestFilters['source']) && empty($requestFilters['filter_group_id']) && !empty($targets)) {
            $defaultTargetId = $this->getDefaultTargetId($targets, $requestFilters['source']);
            if ($defaultTargetId) {
                $filtersToApply['filter_group_id'] = $defaultTargetId;
            }
        }

        // Если есть фильтры для применения - формируем URL для редиректа
        if (!empty($filtersToApply)) {
            $mergedFilters = array_merge($requestFilters, $filtersToApply);
            $queryParams = array_filter($mergedFilters, fn($v) => $v !== null && $v !== '');
            
            $url = route($routeName, $routeParam);
            if (!empty($queryParams)) {
                $url .= '?' . http_build_query($queryParams);
            }

            return [
                'filters' => $mergedFilters,
                'redirect_url' => $url,
            ];
        }

        // Объединяем дефолтные и запрошенные фильтры
        $finalFilters = array_merge($defaultFilters, array_filter($requestFilters, fn($v) => $v !== null && $v !== ''));

        return [
            'filters' => $finalFilters,
            'redirect_url' => null,
        ];
    }

    /**
     * Получить дефолтный тип Wordstat
     */
    private function getDefaultWordstatType(array $wordstatOptions): string
    {
        if (($wordstatOptions['default'] ?? true) !== false) {
            return 'default';
        }
        if ($wordstatOptions['quotes'] ?? false) {
            return 'quotes';
        }
        if ($wordstatOptions['quotes_exclamation_marks'] ?? false) {
            return 'quotes_exclamation_marks';
        }
        if ($wordstatOptions['exclamation_marks'] ?? false) {
            return 'exclamation_marks';
        }
        return '';
    }

    /**
     * Получить дефолтную комбинацию (target) для поисковой системы
     */
    private function getDefaultTargetId(array $targets, string $source): ?string
    {
        $filteredTargets = array_filter($targets, fn($t) => ($t['search_engine'] ?? '') === $source);
        if (empty($filteredTargets)) {
            return null;
        }
        
        $firstTarget = reset($filteredTargets);
        return $firstTarget['id'] ?? null;
    }
}

