import { useMemo, useState, useEffect } from 'react';

export default function VisibilityStats({ positions = [] }) {
    const [animatedStats, setAnimatedStats] = useState({ average: 0, median: 0, total: 0, visible: 0, notFound: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    const stats = useMemo(() => {
        // Фильтруем только валидные позиции (включаем 0, исключаем null, undefined)
        const validPositions = positions
            .filter(pos => pos && pos.rank !== null && pos.rank !== undefined)
            .map(pos => pos.rank);

        if (validPositions.length === 0) {
            return {
                average: 0,
                median: 0,
                total: 0,
                visible: 0
            };
        }

        // Сортируем для расчета медианы
        const sortedPositions = [...validPositions].sort((a, b) => a - b);
        
        // Средняя позиция
        const average = validPositions.reduce((sum, pos) => sum + pos, 0) / validPositions.length;
        
        // Медианная позиция
        const median = sortedPositions.length % 2 === 0
            ? (sortedPositions[sortedPositions.length / 2 - 1] + sortedPositions[sortedPositions.length / 2]) / 2
            : sortedPositions[Math.floor(sortedPositions.length / 2)];

        // Количество видимых позиций (в топ-100, исключаем позицию 0)
        const visible = validPositions.filter(pos => pos > 0 && pos <= 100).length;
        
        // Количество не найденных позиций (позиция 0)
        const notFound = validPositions.filter(pos => pos === 0).length;

        return {
            average: Math.round(average * 10) / 10,
            median: Math.round(median * 10) / 10,
            total: validPositions.length,
            visible,
            notFound
        };
    }, [positions]);

    // Анимация чисел
    useEffect(() => {
        setIsAnimating(true);
        const duration = 1000; // 1 секунда
        const steps = 60; // 60 FPS
        const stepDuration = duration / steps;
        
        const animateValue = (start, end, callback) => {
            let current = start;
            const increment = (end - start) / steps;
            
            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                    current = end;
                    clearInterval(timer);
                    setIsAnimating(false);
                }
                callback(Math.round(current * 10) / 10);
            }, stepDuration);
        };

        animateValue(0, stats.average, (value) => {
            setAnimatedStats(prev => ({ ...prev, average: value }));
        });

        setTimeout(() => {
            animateValue(0, stats.median, (value) => {
                setAnimatedStats(prev => ({ ...prev, median: value }));
            });
        }, 200);

        setTimeout(() => {
            animateValue(0, stats.total, (value) => {
                setAnimatedStats(prev => ({ ...prev, total: value }));
            });
        }, 400);

        setTimeout(() => {
            animateValue(0, stats.notFound, (value) => {
                setAnimatedStats(prev => ({ ...prev, notFound: value }));
            });
        }, 800);
    }, [stats]);

    const formatValue = (value) => {
        return value === 0 ? '0' : value.toString();
    };

    return (
        <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-accent-blue/10 rounded-lg">
                    <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">Видимость</h3>
                    <p className="text-text-muted text-sm">Средняя и медианная позиция</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Средняя позиция */}
                <div className="text-center p-4 bg-secondary-bg rounded-lg transition-all duration-300 hover:bg-secondary-bg/80">
                    <div className={`text-2xl font-bold text-text-primary mb-1 transition-all duration-500 ${
                        isAnimating ? 'scale-110' : 'scale-100'
                    }`}>
                        {formatValue(animatedStats.average)}
                    </div>
                    <div className="text-sm text-text-muted">Средняя</div>
                </div>

                {/* Медианная позиция */}
                <div className="text-center p-4 bg-secondary-bg rounded-lg transition-all duration-300 hover:bg-secondary-bg/80">
                    <div className={`text-2xl font-bold text-text-primary mb-1 transition-all duration-500 ${
                        isAnimating ? 'scale-110' : 'scale-100'
                    }`}>
                        {formatValue(animatedStats.median)}
                    </div>
                    <div className="text-sm text-text-muted">Медианная</div>
                </div>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-4 pt-4 border-t border-border-color">
                <div className="grid grid-cols-3 gap-2 text-sm text-text-muted">
                    <div className="text-center">
                        <div className="font-medium text-text-primary">{animatedStats.total}</div>
                        <div className="text-xs">Всего</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-text-primary">{animatedStats.visible}</div>
                        <div className="text-xs">Видимых</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-text-primary">{animatedStats.notFound}</div>
                        <div className="text-xs">Не найдено</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
