import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';

export default function PositionFilters({
    filters = {},
    projectId,
    project = {}
}) {
    // Определяем значение по умолчанию для поисковика
    const defaultSource = filters.source || project.search_engines?.[0] || '';

    const [localFilters, setLocalFilters] = useState({
        source: defaultSource,
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        rank_from: filters.rank_from || '',
        rank_to: filters.rank_to || '',
    });

    const [reportLinks, setReportLinks] = useState({
        excel: null,
        html: null
    });

    // Обновляем локальные фильтры при изменении пропсов
    React.useEffect(() => {
        setLocalFilters({
            source: filters.source || project.search_engines?.[0] || '',
            date_from: filters.date_from || '',
            date_to: filters.date_to || '',
            rank_from: filters.rank_from || '',
            rank_to: filters.rank_to || '',
        });
    }, [filters.source, filters.date_from, filters.date_to, filters.rank_from, filters.rank_to, project.search_engines]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        const queryParams = new URLSearchParams();

        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== '' && value !== false && value !== null) {
                queryParams.append(key, value);
            }
        });

        router.visit(route('seo-stats.reports', projectId) + '?' + queryParams.toString(), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({
            source: project.search_engines?.[0] || '',
            date_from: '',
            date_to: '',
            rank_from: '',
            rank_to: '',
        });

        router.visit(route('seo-stats.reports', projectId), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = localFilters.date_from !== '' || localFilters.date_to !== '' || localFilters.rank_from !== '' || localFilters.rank_to !== '' || filters.date_sort || filters.sort_type;

    const getRankRangeLabel = () => {
        if (localFilters.rank_from === '' || localFilters.rank_to === '') return null;
        
        const from = parseInt(localFilters.rank_from);
        const to = parseInt(localFilters.rank_to);
        
        if (from === 0 && to === 0) return 'Не найдено';
        if (from === 1 && to === 3) return '1-3';
        if (from === 4 && to === 10) return '4-10';
        if (from === 11 && to === 30) return '11-30';
        if (from === 31 && to === 50) return '31-50';
        if (from === 51 && to === 100) return '51-100';
        if (from === 101 && to === 999) return '100+';
        
        return `${from}-${to}`;
    };

    const hasDateFilters = localFilters.date_from !== '' || localFilters.date_to !== '';
    const hasRankFilter = localFilters.rank_from !== '' || localFilters.rank_to !== '';
    const rankLabel = getRankRangeLabel();

    const handleExport = async (type) => {
        try {
            // Получаем CSRF токен
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            const response = await fetch(route('reports.export'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    site_id: projectId,
                    type: type,
                    filters: localFilters
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Сохраняем ссылку в состоянии
            setReportLinks(prev => ({
                ...prev,
                [type]: data.url
            }));
        } catch (error) {
            console.error('Export error:', error);
            alert('Ошибка при создании отчета. Проверьте логи сервера.');
        }
    };

    return (
        <>
            {/* Блок фильтров */}
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="card-title">Фильтры позиций</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearFilters}
                            className="btn btn-secondary"
                        >
                            Сбросить
                        </button>
                        <button
                            onClick={applyFilters}
                            className="btn btn-primary"
                        >
                            Применить
                        </button>
                    </div>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Поисковая система */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Поисковая система
                    </label>
                    <select
                        value={localFilters.source}
                        onChange={(e) => handleFilterChange('source', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                    >
                        {project.search_engines?.map(searchEngine => (
                            <option key={searchEngine} value={searchEngine}>
                                {searchEngine === 'google' ? 'Google' :
                                 searchEngine === 'yandex' ? 'Яндекс' :
                                 searchEngine}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Дата от */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Дата от
                    </label>
                    <input
                        type="date"
                        value={localFilters.date_from}
                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                    />
                </div>

                {/* Дата до */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Дата до
                    </label>
                    <input
                        type="date"
                        value={localFilters.date_to}
                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                    />
                </div>
            </div>

            {hasActiveFilters && (
                <div className="mt-4 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <div className="flex items-start gap-2 text-sm text-accent-blue mb-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        <span className="font-medium">Активные фильтры:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                        {rankLabel && (
                            <span className="px-3 py-1 bg-accent-blue/20 border border-accent-blue/30 rounded-full text-xs font-medium text-accent-blue flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Диапазон: {rankLabel}
                            </span>
                        )}
                        {hasDateFilters && (
                            <span className="px-3 py-1 bg-accent-blue/20 border border-accent-blue/30 rounded-full text-xs font-medium text-accent-blue flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {localFilters.date_from && localFilters.date_to 
                                    ? `Даты: ${localFilters.date_from} - ${localFilters.date_to}`
                                    : localFilters.date_from 
                                        ? `С: ${localFilters.date_from}`
                                        : `До: ${localFilters.date_to}`
                                }
                            </span>
                        )}
                        {filters.date_sort && (
                            <span className={`px-3 py-1 border rounded-full text-xs font-medium flex items-center gap-1 ${
                                filters.sort_type === 'asc' 
                                    ? 'bg-green-100 border-green-500 text-green-700' 
                                    : 'bg-red-100 border-red-500 text-red-700'
                            }`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d={filters.sort_type === 'asc' 
                                            ? "M5 15l7-7 7 7" 
                                            : "M19 9l-7 7-7-7"
                                        } 
                                    />
                                </svg>
                                Сортировка: {new Date(filters.date_sort).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} ({filters.sort_type === 'asc' ? '↑' : '↓'})
                            </span>
                        )}
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
