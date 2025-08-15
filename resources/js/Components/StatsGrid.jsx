/**
 * Компонент для отображения статистических карточек
 * @param {Array} stats - массив объектов статистики
 * [
 *   {
 *     label: 'Всего',
 *     value: 10,
 *     color: 'text-text-primary' | 'text-accent-green' | etc.
 *   }
 * ]
 * @param {number} columns - количество колонок (по умолчанию 4)
 * @param {string} className - дополнительные CSS классы
 */
export default function StatsGrid({ stats = [], columns = 4, className = '' }) {
    const getGridClasses = () => {
        const baseClasses = 'grid grid-cols-1 gap-4';
        const responsiveClasses = {
            2: 'md:grid-cols-2',
            3: 'md:grid-cols-3',
            4: 'md:grid-cols-2 lg:grid-cols-4',
            5: 'md:grid-cols-2 lg:grid-cols-5'
        };
        
        return `${baseClasses} ${responsiveClasses[columns] || 'md:grid-cols-4'}`;
    };

    if (!stats.length) {
        return null;
    }

    return (
        <div className={`${getGridClasses()} ${className}`}>
            {stats.map((stat, index) => (
                <div key={index} className="card text-center">
                    <div className={`text-2xl font-bold mb-1 ${stat.color || 'text-text-primary'}`}>
                        {stat.value}
                    </div>
                    <div className="text-sm text-text-secondary">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
