import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function PositionsTable({ 
    keywords = [], 
    positions = [], 
    siteId,
    filters = {},
    pagination = {}
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [allKeywords, setAllKeywords] = useState(keywords);
    const [allPositions, setAllPositions] = useState(positions);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const observerRef = useRef();
    const loadingRef = useRef();

    const uniqueDates = useMemo(() => {
        const dates = new Set();
        if (Array.isArray(allPositions)) {
            allPositions.forEach(pos => {
                if (pos.date) {
                    const dateOnly = pos.date.split('T')[0];
                    dates.add(dateOnly);
                }
            });
        }
        
        const sortedDates = Array.from(dates).sort();
        const today = new Date().toISOString().split('T')[0];
        
        if (sortedDates.includes(today)) {
            return [today, ...sortedDates.filter(date => date !== today)];
        }
        
        return sortedDates;
    }, [allPositions]);

    const loadMorePositions = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await axios.get(`/seo-stats/${siteId}/positions`, {
                params: {
                    ...filters,
                    page: currentPage + 1,
                    per_page: 10
                }
            });

            const { keywords: newKeywords, positions: newPositions, has_more, pagination } = response.data;
            
            setAllKeywords(prev => {
                const existingIds = new Set(prev.map(k => k.id));
                const uniqueNewKeywords = newKeywords.filter(k => !existingIds.has(k.id));
                return [...prev, ...uniqueNewKeywords];
            });
            
            setAllPositions(prev => [...prev, ...(newPositions || [])]);
            setCurrentPage(prev => prev + 1);
            setHasMore(has_more || false);
        } catch (error) {
            console.error('Ошибка загрузки позиций:', error);
        } finally {
            setLoading(false);
        }
    }, [siteId, filters, currentPage, loading, hasMore]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMorePositions();
                }
            },
            { threshold: 0.1 }
        );

        if (loadingRef.current) {
            observer.observe(loadingRef.current);
        }

        return () => {
            if (loadingRef.current) {
                observer.unobserve(loadingRef.current);
            }
        };
    }, [loadMorePositions, hasMore, loading]);

    useEffect(() => {
        setAllKeywords(Array.isArray(keywords) ? keywords : []);
        setAllPositions(Array.isArray(positions) ? positions : []);
        setCurrentPage(1);
        setHasMore(true);
    }, [keywords, positions, filters]);

    const filteredAndSortedKeywords = useMemo(() => {
        let filtered = allKeywords.filter(keyword => 
            keyword.value.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Применяем сортировку только если пользователь выбрал колонку для сортировки
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a.value.toLowerCase();
                const bValue = b.value.toLowerCase();
                
                if (sortConfig.direction === 'asc') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            });
        }

        return filtered;
    }, [allKeywords, searchTerm, sortConfig]);

    const getFrequencyForKeyword = (keywordId) => {
        if (!Array.isArray(allPositions)) return null;
        
        const wordstatPosition = allPositions.find(pos => 
            pos.keyword_id === keywordId && pos.source === 'wordstat'
        );
        return wordstatPosition ? wordstatPosition.rank : null;
    };

    const getPositionForKeyword = (keywordId, date) => {
        if (!Array.isArray(allPositions)) return null;
        
        const position = allPositions.find(pos => {
            const posDateOnly = pos.date ? pos.date.split('T')[0] : '';
            return pos.keyword_id === keywordId && posDateOnly === date && pos.source !== 'wordstat';
        });
        return position ? position.rank : null;
    };

    const getPositionChange = (keywordId, date) => {
        const dates = uniqueDates;
        const currentIndex = dates.indexOf(date);
        if (currentIndex <= 0) return null;
        
        const currentPosition = getPositionForKeyword(keywordId, date);
        const previousPosition = getPositionForKeyword(keywordId, dates[currentIndex - 1]);
        
        if (currentPosition === null || previousPosition === null) return null;
        
        return previousPosition - currentPosition;
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const getDateSortState = (date) => {
        if (filters.date_sort === date) {
            return filters.sort_type || 'asc';
        }
        return null;
    };

    const handleDateClick = (date) => {
        const currentSort = getDateSortState(date);
        const newFilters = { ...filters };

        delete newFilters.wordstat_sort;

        if (!currentSort) {
            newFilters.date_sort = date;
            newFilters.sort_type = 'asc';
        } else if (currentSort === 'asc') {
            newFilters.date_sort = date;
            newFilters.sort_type = 'desc';
        } else {
            delete newFilters.date_sort;
            delete newFilters.sort_type;
        }

        const queryParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== '' && value !== false && value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        });

        router.visit(route('seo-stats.reports', siteId) + '?' + queryParams.toString(), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getWordstatSortState = () => {
        return filters.wordstat_sort || null;
    };

    const handleWordstatClick = () => {
        const currentSort = getWordstatSortState();
        const newFilters = { ...filters };

        delete newFilters.date_sort;
        delete newFilters.sort_type;

        if (!currentSort) {
            newFilters.wordstat_sort = 'desc';
        } else if (currentSort === 'desc') {
            newFilters.wordstat_sort = 'asc';
        } else {
            delete newFilters.wordstat_sort;
        }

        const queryParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== '' && value !== false && value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        });

        router.visit(route('seo-stats.reports', siteId) + '?' + queryParams.toString(), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    if (allKeywords.length === 0) {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-12 text-center">
                <div className="text-text-muted mb-4">
                    <svg className="mx-auto h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Нет ключевых слов</h3>
                <p className="text-text-muted mb-4">Добавьте ключевые слова для отслеживания позиций</p>
            </div>
        );
    }

    return (
        <div className="bg-card-bg border border-border-color rounded-xl overflow-hidden shadow-sm">
            {/* Заголовок и инструменты */}
            <div className="px-6 py-4 border-b border-border-color bg-secondary-bg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Статистика позиций ({pagination.total || filteredAndSortedKeywords.length})
                        </h3>
                        <span className="text-sm text-text-muted">
                            Загружено {allKeywords.length} ключевых слов ({allPositions.length} позиций)
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Поиск */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Поиск ключевых слов..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-10 pr-4 py-2 w-64 bg-primary-bg border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/20 text-sm"
                            />
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Экспорт */}
                        <button className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors text-sm font-medium">
                            Экспорт
                        </button>
                    </div>
                </div>
            </div>

            {/* Таблица */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-secondary-bg">
                        <tr>
                            {/* Ключевое слово */}
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('keyword')}
                                    className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent-blue transition-colors"
                                >
                                    Ключевое слово
                                    <svg className={`w-4 h-4 transition-transform ${
                                        sortConfig.key === 'keyword' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                                    } ${sortConfig.key === 'keyword' ? 'text-accent-blue' : 'text-text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </button>
                            </th>

                            {/* Частота */}
                            <th 
                                className={`px-6 py-3 text-center text-sm font-medium text-text-primary min-w-[120px] cursor-pointer transition-all ${
                                    filters.wordstat_sort ? (filters.wordstat_sort === 'desc' ? 'border-2 border-green-500' : 'border-2 border-red-500') : 'hover:bg-secondary-bg/50'
                                }`}
                                onClick={handleWordstatClick}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    <span>Частота</span>
                                    {filters.wordstat_sort && (
                                        <svg 
                                            className="w-4 h-4 text-text-primary" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth="2" 
                                                d={filters.wordstat_sort === 'desc' 
                                                    ? "M5 15l7-7 7 7" 
                                                    : "M19 9l-7 7-7-7"
                                                } 
                                            />
                                        </svg>
                                    )}
                                </div>
                            </th>

                            {/* Даты */}
                            {uniqueDates.map((date, index) => {
                                const today = new Date().toISOString().split('T')[0];
                                const isToday = date === today;
                                const sortState = getDateSortState(date);
                                const isSorted = sortState !== null;
                                
                                return (
                                    <th 
                                        key={`${date}-${index}`} 
                                        className={`px-3 py-3 text-center text-sm font-medium min-w-[100px] cursor-pointer transition-all ${
                                            isToday ? 'bg-accent-blue/20 border-2 border-accent-blue text-accent-blue' : 'text-text-primary hover:bg-secondary-bg/50'
                                        } ${isSorted ? (sortState === 'asc' ? 'border-2 border-green-500' : 'border-2 border-red-500') : ''}`}
                                        onClick={() => handleDateClick(date)}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1">
                                                <span className={`font-medium ${isToday ? 'font-bold text-lg' : ''}`}>
                                                    {new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                                                </span>
                                                {isSorted && (
                                                    <svg 
                                                        className="w-4 h-4 text-text-primary" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth="2" 
                                                            d={sortState === 'asc' 
                                                                ? "M5 15l7-7 7 7" 
                                                                : "M19 9l-7 7-7-7"
                                                            } 
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-xs font-normal ${isToday ? 'font-bold text-accent-blue' : 'text-text-muted'}`}>
                                                {new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                                            </span>
                                        </div>
                                    </th>
                                );
                            })}

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {filteredAndSortedKeywords.map((keyword) => {
                            return (
                                <tr key={keyword.id} className="hover:bg-secondary-bg/50 transition-colors duration-150">
                                    {/* Ключевое слово */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="text-text-primary font-medium text-sm">
                                                    {keyword.value}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Частота */}
                                    <td className="px-6 py-4 text-center">
                                        {(() => {
                                            const frequency = getFrequencyForKeyword(keyword.id);
                                            return frequency !== null ? (
                                                <div className="text-text-primary font-medium text-sm">
                                                    {frequency.toLocaleString('ru-RU')}
                                                </div>
                                            ) : (
                                                <div className="text-text-muted text-sm">-</div>
                                            );
                                        })()}
                                    </td>

                                    {/* Позиции по датам */}
                                    {uniqueDates.map((date, index) => {
                                        const position = getPositionForKeyword(keyword.id, date);
                                        const change = getPositionChange(keyword.id, date);
                                        const today = new Date().toISOString().split('T')[0];
                                        const isToday = date === today;
                                        
                                        return (
                                            <td key={`${date}-${keyword.id}-${index}`} className={`w-12 h-12 px-1 py-1 text-center min-w-[100px] ${
                                                isToday ? 'border-2 border-accent-blue' : ''
                                            }`}>
                                                <div className={`w-full h-full flex flex-col items-center justify-center ${
                                                    position === null ? 'bg-gray-200' : 
                                                    position === 0 ? 'bg-gray-400' :
                                                    position <= 3 ? 'bg-green-500' :
                                                    position <= 10 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                } ${isToday ? 'ring-2 ring-accent-blue ring-offset-1' : ''}`}>
                                                    <span className={`text-sm font-bold ${
                                                        position === null ? 'text-gray-600' : 
                                                        'text-white'
                                                    } ${isToday ? 'text-lg' : ''}`}>
                                                        {position !== null ? position : '-'}
                                                    </span>
                                                    {change !== null && (
                                                        <span className={`text-xs font-medium ${
                                                            change > 0 ? 'text-green-200' : 
                                                            change < 0 ? 'text-red-200' : 
                                                            'text-gray-200'
                                                        }`}>
                                                            {change > 0 ? '↑' : change < 0 ? '↓' : '='} {Math.abs(change)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {/* Индикатор загрузки для бесконечной прокрутки */}
                {hasMore && (
                    <div ref={loadingRef} className="px-6 py-4 text-center">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 text-text-muted">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue"></div>
                                <span>Загрузка позиций...</span>
                            </div>
                        ) : (
                            <div className="text-text-muted text-sm">
                                Прокрутите вниз для загрузки дополнительных позиций
                            </div>
                        )}
                    </div>
                )}
                
                {!hasMore && allPositions.length > 0 && (
                    <div className="px-6 py-4 text-center text-text-muted text-sm">
                        Все позиции загружены
                    </div>
                )}
            </div>

            {/* Подвал таблицы */}
            <div className="px-6 py-3 border-t border-border-color bg-secondary-bg">
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <div>
                        Показано {filteredAndSortedKeywords.length} из {keywords.length} ключевых слов
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Даты: {uniqueDates.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
