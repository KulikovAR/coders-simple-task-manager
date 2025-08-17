import { getStatusClass } from '@/utils/statusUtils';

/**
 * Компонент бейджа для статуса задачи
 * @param {object} status - объект статуса с полями name и color
 * @param {string} statusName - имя статуса (если передается напрямую)
 * @param {string} className - дополнительные CSS классы
 * @param {boolean} useDynamicColors - использовать динамические цвета из базы данных
 */
export default function StatusBadge({ status, statusName, className = '', useDynamicColors = true }) {
    const name = status?.name || statusName;
    const color = status?.color;
    
    if (!name) {
        return null;
    }

    // Если включены динамические цвета и есть цвет из базы данных
    if (useDynamicColors && color) {
        return (
            <span 
                className={`status-badge ${className}`}
                style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    border: `1px solid ${color}30`
                }}
            >
                {name}
            </span>
        );
    }

    // Иначе используем статические CSS классы
    return (
        <span className={`status-badge ${getStatusClass(name)} ${className}`}>
            {name}
        </span>
    );
}
