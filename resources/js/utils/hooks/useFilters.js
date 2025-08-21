import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Хук для управления фильтрами с поддержкой debounce
 * @param {Object} initialFilters - начальные значения фильтров
 * @param {string} routeName - имя маршрута для обновления
 * @param {Object} options - дополнительные опции
 * @returns {Object} - состояние и методы для работы с фильтрами
 */
export function useFilters(initialFilters = {}, routeName, options = {}) {
    const {
        debounceTime = 300,
        preserveState = true,
        preserveScroll = true,
    } = options;

    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(
        Object.values(initialFilters).some(value => !!value)
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Получаем все текущие параметры URL
            const urlParams = new URLSearchParams(window.location.search);
            const currentParams = {};
            
            // Сохраняем все существующие параметры URL
            for (const [key, value] of urlParams.entries()) {
                if (key !== 'page' && !filters.hasOwnProperty(key)) {
                    currentParams[key] = value;
                }
            }
            
            // Объединяем текущие фильтры с сохраненными параметрами
            const params = { 
                ...currentParams,
                ...filters,
                page: urlParams.get('page') || '1'
            };

            // Удаляем пустые значения
            Object.keys(params).forEach(key => {
                if (!params[key]) {
                    delete params[key];
                }
            });

            router.get(route(routeName), params, {
                preserveState,
                preserveScroll,
                replace: true,
            });
        }, debounceTime);

        return () => clearTimeout(timeoutId);
    }, [filters, routeName]);

    const updateFilter = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({});
        setShowFilters(false);
        // При очистке фильтров также сбрасываем страницу
        router.get(route(routeName), {}, {
            preserveState,
            preserveScroll,
            replace: true
        });
    };

    return {
        filters,
        showFilters,
        setShowFilters,
        updateFilter,
        clearFilters,
        // Удобные геттеры для отдельных фильтров
        search: filters.search,
        status: filters.status,
        // Удобные сеттеры для отдельных фильтров
        setSearch: (value) => updateFilter('search', value),
        setStatus: (value) => updateFilter('status', value),
    };
}
