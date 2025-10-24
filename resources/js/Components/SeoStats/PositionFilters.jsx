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
        });
    }, [filters.source, filters.date_from, filters.date_to, project.search_engines]);

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
        });

        router.visit(route('seo-stats.reports', projectId), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = localFilters.date_from !== '' || localFilters.date_to !== '';

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
                <div className="mt-4 p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-accent-blue">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Активные фильтры применены. Нажмите "Применить" для обновления данных.
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
