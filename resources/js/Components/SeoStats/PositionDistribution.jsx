import { useMemo, useState, useEffect } from 'react';

export default function PositionDistribution({ positions = [] }) {
    const [animatedDistribution, setAnimatedDistribution] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const distribution = useMemo(() => {
        const ranges = [
            { label: 'Не найдено', min: 0, max: 0, color: '#6B7280' }, // серый для позиции 0
            { label: '1-3', min: 1, max: 3, color: '#10B981' }, // зеленый
            { label: '4-10', min: 4, max: 10, color: '#F59E0B' }, // желтый
            { label: '11-30', min: 11, max: 30, color: '#EF4444' }, // красный
            { label: '31-50', min: 31, max: 50, color: '#8B5CF6' }, // фиолетовый
            { label: '51-100', min: 51, max: 100, color: '#6B7280' }, // серый
            { label: '100+', min: 101, max: Infinity, color: '#374151' } // темно-серый
        ];

        // Фильтруем только валидные позиции (включаем 0, исключаем null, undefined)
        const validPositions = positions
            .filter(pos => pos && pos.rank !== null && pos.rank !== undefined)
            .map(pos => pos.rank);

        const total = validPositions.length;

        if (total === 0) {
            return ranges.map(range => ({
                ...range,
                count: 0,
                percentage: 0
            }));
        }

        return ranges.map(range => {
            const count = validPositions.filter(pos => 
                pos >= range.min && pos <= range.max
            ).length;
            
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return {
                ...range,
                count,
                percentage: Math.round(percentage * 10) / 10
            };
        });
    }, [positions]);

    // Анимация прогресс-баров
    useEffect(() => {
        setIsAnimating(true);
        const duration = 1200; // 1.2 секунды
        const steps = 60;
        const stepDuration = duration / steps;
        
        const animateDistribution = () => {
            let step = 0;
            const timer = setInterval(() => {
                step++;
                const progress = step / steps;
                
                const animated = distribution.map(item => ({
                    ...item,
                    animatedPercentage: Math.round(item.percentage * progress * 10) / 10,
                    animatedCount: Math.round(item.count * progress)
                }));
                
                setAnimatedDistribution(animated);
                
                if (step >= steps) {
                    clearInterval(timer);
                    setIsAnimating(false);
                }
            }, stepDuration);
        };

        animateDistribution();
    }, [distribution]);

    const formatValue = (value) => {
        return value === 0 ? '0' : value.toString();
    };

    return (
        <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-accent-green/10 rounded-lg">
                    <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">Распределение позиций</h3>
                    <p className="text-text-muted text-sm">Процентное соотношение по диапазонам</p>
                </div>
            </div>

            <div className="space-y-3">
                {(animatedDistribution.length > 0 ? animatedDistribution : distribution).map((range, index) => (
                    <div key={index} className="flex items-center gap-3">
                        {/* Цветовой индикатор */}
                        <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: range.color }}
                        />
                        
                        {/* Диапазон */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-text-primary">
                                    {range.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm text-text-primary font-medium transition-all duration-300 ${
                                        isAnimating ? 'scale-105' : 'scale-100'
                                    }`}>
                                        {formatValue(range.animatedCount || range.count)}
                                    </span>
                                    <span className="text-sm text-text-muted">
                                        ({formatValue(range.animatedPercentage || range.percentage)}%)
                                    </span>
                                </div>
                            </div>
                            
                            {/* Прогресс-бар */}
                            <div className="mt-1 w-full bg-secondary-bg rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ 
                                        width: `${range.animatedPercentage || range.percentage}%`,
                                        backgroundColor: range.color 
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Общая статистика */}
            <div className="mt-4 pt-4 border-t border-border-color">
                <div className="flex justify-between text-sm text-text-muted">
                    <span>Всего позиций:</span>
                    <span className={`font-medium text-text-primary transition-all duration-300 ${
                        isAnimating ? 'scale-105' : 'scale-100'
                    }`}>
                        {(animatedDistribution.length > 0 ? animatedDistribution : distribution).reduce((sum, range) => sum + (range.animatedCount || range.count), 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}
