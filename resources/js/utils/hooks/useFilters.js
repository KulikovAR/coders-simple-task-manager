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
            router.get(route(routeName), filters, {
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
        router.get(route(routeName), {}, {
            preserveState,
            preserveScroll,
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
