import { useMemo } from 'react';
import PieChart from './PieChart';
import VisibilityStats from './VisibilityStats';
import PositionDistribution from './PositionDistribution';

export default function StatsSection({ keywords = [], positions = [] }) {
    // Подготавливаем данные для круговой диаграммы
    const pieChartData = useMemo(() => {
        // Фильтруем только валидные позиции (включаем 0, исключаем null, undefined)
        const validPositions = positions
            .filter(pos => pos && pos.rank !== null && pos.rank !== undefined)
            .map(pos => pos.rank);

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
    }, [positions]);

    // Если нет данных, показываем пустое состояние
    if (keywords.length === 0 || positions.length === 0) {
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
        <div className="mb-6">
            {/* Сетка с компонентами статистики */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Круговая диаграмма */}
                <div className="bg-card-bg border border-border-color rounded-xl p-6">
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
                <VisibilityStats positions={positions} />

                {/* Распределение позиций */}
                <PositionDistribution positions={positions} />
            </div>
        </div>
    );
}
