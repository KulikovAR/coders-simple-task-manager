import { getStatusClass } from '@/utils/statusUtils';

/**
 * Компонент бейджа для статуса задачи
 * @param {object} status - объект статуса с полем name
 * @param {string} statusName - имя статуса (если передается напрямую)
 * @param {string} className - дополнительные CSS классы
 */
export default function StatusBadge({ status, statusName, className = '' }) {
    const name = status?.name || statusName;
    
    if (!name) {
        return null;
    }

    return (
        <span className={`status-badge ${getStatusClass(name)} ${className}`}>
            {name}
        </span>
    );
}
