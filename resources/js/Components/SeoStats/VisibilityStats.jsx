import { useMemo } from 'react';

export default function VisibilityStats({ positions = [] }) {
    const stats = useMemo(() => {
        // Фильтруем только валидные позиции (исключаем null, undefined, 0)
        const validPositions = positions
            .filter(pos => pos && pos.rank && pos.rank > 0)
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

        // Количество видимых позиций (в топ-100)
        const visible = validPositions.filter(pos => pos <= 100).length;

        return {
            average: Math.round(average * 10) / 10,
            median: Math.round(median * 10) / 10,
            total: validPositions.length,
            visible
        };
    }, [positions]);

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
                <div className="text-center p-4 bg-secondary-bg rounded-lg">
                    <div className="text-2xl font-bold text-text-primary mb-1">
                        {formatValue(stats.average)}
                    </div>
                    <div className="text-sm text-text-muted">Средняя</div>
                </div>

                {/* Медианная позиция */}
                <div className="text-center p-4 bg-secondary-bg rounded-lg">
                    <div className="text-2xl font-bold text-text-primary mb-1">
                        {formatValue(stats.median)}
                    </div>
                    <div className="text-sm text-text-muted">Медианная</div>
                </div>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-4 pt-4 border-t border-border-color">
                <div className="flex justify-between text-sm text-text-muted">
                    <span>Всего позиций: {stats.total}</span>
                    <span>Видимых (≤100): {stats.visible}</span>
                </div>
            </div>
        </div>
    );
}
