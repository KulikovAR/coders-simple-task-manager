import { getPriorityColor, getPriorityLabel, getPriorityIcon } from '@/utils/statusUtils';

/**
 * Компонент бейджа для приоритета задачи
 * @param {string} priority - уровень приоритета (low, medium, high)
 * @param {boolean} showIcon - показывать иконку
 * @param {string} className - дополнительные CSS классы
 */
export default function PriorityBadge({ priority, showIcon = true, className = '' }) {
    if (!priority) {
        return null;
    }

    return (
        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-caption font-medium shadow-sm ${getPriorityColor(priority)} ${className}`}>
            {showIcon && (
                <span className="text-sm mr-2">{getPriorityIcon(priority)}</span>
            )}
            <span>{getPriorityLabel(priority)}</span>
        </span>
    );
}
