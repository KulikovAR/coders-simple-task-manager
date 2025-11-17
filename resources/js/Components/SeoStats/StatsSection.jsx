import { useMemo, useState, useEffect } from 'react';
import PieChart from './PieChart';
import VisibilityStats from './VisibilityStats';
import PositionDistribution from './PositionDistribution';

export default function StatsSection({ keywords = [], positions = [], statistics = {}, filters = {}, projectId }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('seoStatsSectionCollapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('seoStatsSectionCollapsed', isCollapsed.toString());
    }, [isCollapsed]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };
    const pieChartData = useMemo(() => {
        if (statistics.position_ranges || statistics.keywords_count) {
            console.log('Statistics from microservice:', statistics);
            console.log('Position ranges:', statistics.position_ranges);
            
            var top_3 = (statistics.position_ranges?.['1_3'] || 0) 
            var top_4_10 = (statistics.position_ranges?.['4_10'] || 0)  
            var top_11_plus = (statistics.position_ranges?.['11_30'] || 0) + (statistics.position_ranges?.['31_50'] || 0) + (statistics.position_ranges?.['51_100'] || 0) + (statistics.position_ranges?.['100_plus'] || 0)

            return [
                {
                    label: 'Не найдено',
                    value: statistics.position_ranges?.not_found || 0,
                    color: '#6B7280'
                },
                {
                    label: 'Топ-3 позиции',
                    value: top_3,
                    color: '#10B981'
                },
                {
                    label: 'Позиции 4-10',
                    value: top_4_10,
                    color: '#F59E0B'
                },
                {
                    label: 'Позиции 11+',
                    value: top_11_plus,
                    color: '#EF4444'
                }
            ];
        }

        let filteredPositions = [];
        if (Array.isArray(positions)) {
            filteredPositions = positions.filter(pos => pos && pos.rank !== null && pos.rank !== undefined);
        }
        
        if (filters.source) {
            filteredPositions = filteredPositions.filter(pos => pos.source === filters.source);
        }
        
        if (filters.date_from) {
            filteredPositions = filteredPositions.filter(pos => {
                const posDate = new Date(pos.date);
                const fromDate = new Date(filters.date_from);
                return posDate >= fromDate;
            });
        }
        
        if (filters.date_to) {
            filteredPositions = filteredPositions.filter(pos => {
                const posDate = new Date(pos.date);
                const toDate = new Date(filters.date_to);
                return posDate <= toDate;
            });
        }

        const validPositions = filteredPositions.map(pos => pos.rank);

        const green = validPositions.filter(pos => pos > 0 && pos <= 3).length;
        const yellow = validPositions.filter(pos => pos > 3 && pos <= 10).length;
        const red = validPositions.filter(pos => pos > 10).length;
        const zero = validPositions.filter(pos => pos === 0).length;

        return [
            {
                label: 'Не найдено',
                value: zero,
                color: '#6B7280'
            },
            {
                label: 'Топ-3 позиции',
                value: green,
                color: '#10B981'
            },
            {
                label: 'Позиции 4-10',
                value: yellow,
                color: '#F59E0B'
            },
            {
                label: 'Позиции 11+',
                value: red,
                color: '#EF4444'
            }
        ];
    }, [statistics, positions, filters]);

    if (keywords.length === 0 || ((!Array.isArray(positions) || positions.length === 0) && !statistics.total_positions && !statistics.keywords_count)) {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-8 text-center mb-6">
                <div className="text-text-muted mb-4">
                    <svg className="mx-auto h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Нет данных для статистики</h3>
                <p className="text-text-muted">Добавьте ключевые слова и запустите отслеживание позиций</p>
            </div>
        );
    }

    return (
        <div className="mb-6 bg-card-bg border border-border-color rounded-xl overflow-hidden relative">
            {/* Кнопка сворачивания в правом верхнем углу */}
            <button
                onClick={toggleCollapse}
                className="absolute top-3 right-3 z-10 p-1.5 bg-secondary-bg hover:bg-accent-blue/10 border border-border-color rounded-md text-text-muted hover:text-accent-blue transition-all duration-200 shadow-sm hover:shadow-md"
                title={isCollapsed ? 'Развернуть статистику' : 'Свернуть статистику'}
            >
                {isCollapsed ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                )}
            </button>

            {isCollapsed ? (
                // Свернутое состояние - маленькая полоска
                <div className="h-12 flex items-center px-4">
                    <div className="flex items-center gap-2 text-text-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-sm font-medium">Статистика позиций</span>
                    </div>
                </div>
            ) : (
                // Развернутое состояние - полная статистика
                <div className="p-6">
                    {/* Сетка с компонентами статистики */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Круговая диаграмма */}
                        <div className="bg-secondary-bg border border-border-color rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-accent-green/10 rounded-lg">
                                    <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-text-primary">Категории позиций</h3>
                                    <p className="text-text-muted text-sm">Распределение по диапазонам</p>
                                </div>
                            </div>
                            <PieChart data={pieChartData} />
                        </div>

                        {/* Статистика видимости */}
                        <VisibilityStats positions={positions} filters={filters} statistics={statistics} />

                        {/* Распределение позиций */}
                        <PositionDistribution positions={positions} filters={filters} statistics={statistics} projectId={projectId} />
                    </div>
                </div>
            )}
        </div>
    );
}
