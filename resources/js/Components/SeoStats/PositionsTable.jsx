import { useState, useMemo } from 'react';

export default function PositionsTable({ 
    keywords = [], 
    positions = [], 
    dateRange = '7'
}) {
    const [sortConfig, setSortConfig] = useState({ key: 'keyword', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');

    // Получаем уникальные даты
    const uniqueDates = useMemo(() => {
        const dates = new Set();
        positions.forEach(pos => {
            if (pos.date) {
                const dateOnly = pos.date.split('T')[0];
                dates.add(dateOnly);
            }
        });
        return Array.from(dates)
            .sort()
            .slice(-parseInt(dateRange));
    }, [positions, dateRange]);

    // Фильтрация и сортировка ключевых слов
    const filteredAndSortedKeywords = useMemo(() => {
        let filtered = keywords.filter(keyword => 
            keyword.value.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            const aValue = a.value.toLowerCase();
            const bValue = b.value.toLowerCase();
            
            if (sortConfig.direction === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        return filtered;
    }, [keywords, searchTerm, sortConfig]);

    // Получение позиции для ключевого слова и даты
    const getPositionForKeyword = (keywordId, date) => {
        const position = positions.find(pos => {
            const posDateOnly = pos.date ? pos.date.split('T')[0] : '';
            return pos.keyword_id === keywordId && posDateOnly === date;
        });
        return position ? position.rank : null;
    };

    // Расчет изменений позиций
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

    if (keywords.length === 0) {
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
                            Статистика позиций ({filteredAndSortedKeywords.length})
                        </h3>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Поиск */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Поиск ключевых слов..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </button>
                            </th>

                            {/* Даты */}
                            {uniqueDates.map((date, index) => (
                                <th key={`${date}-${index}`} className="px-3 py-3 text-center text-sm font-medium text-text-primary min-w-[100px]">
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                        <span className="text-xs text-text-muted font-normal">
                                            {new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                                        </span>
                                    </div>
                                </th>
                            ))}

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

                                    {/* Позиции по датам */}
                                    {uniqueDates.map((date, index) => {
                                        const position = getPositionForKeyword(keyword.id, date);
                                        const change = getPositionChange(keyword.id, date);
                                        
                                        return (
                                            <td key={`${date}-${keyword.id}-${index}`} className="w-12 h-12 px-1 py-1 text-center min-w-[100px]">
                                                <div className={`w-full h-full flex flex-col items-center justify-center ${
                                                    position === null ? 'bg-gray-200' : 
                                                    position <= 3 ? 'bg-green-500' :
                                                    position <= 10 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}>
                                                    <span className={`text-sm font-bold ${
                                                        position === null ? 'text-gray-600' : 
                                                        'text-white'
                                                    }`}>
                                                        {position || '-'}
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
            </div>

            {/* Подвал таблицы */}
            <div className="px-6 py-3 border-t border-border-color bg-secondary-bg">
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <div>
                        Показано {filteredAndSortedKeywords.length} из {keywords.length} ключевых слов
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Период: {dateRange} дней</span>
                        <span>Даты: {uniqueDates.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
