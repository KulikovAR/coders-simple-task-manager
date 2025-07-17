// Утилиты для работы со статусами задач
// Соответствует enum TaskStatusType в бэкенде

export const TASK_STATUSES = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    TESTING: 'Testing',
    READY_FOR_RELEASE: 'Ready for Release',
    DONE: 'Done',
};

export const TASK_STATUS_LABELS = {
    [TASK_STATUSES.TODO]: 'К выполнению',
    [TASK_STATUSES.IN_PROGRESS]: 'В работе',
    [TASK_STATUSES.REVIEW]: 'На проверке',
    [TASK_STATUSES.TESTING]: 'Тестирование',
    [TASK_STATUSES.READY_FOR_RELEASE]: 'Готово к релизу',
    [TASK_STATUSES.DONE]: 'Завершена',
};

export const TASK_STATUS_COLORS = {
    [TASK_STATUSES.TODO]: '#6B7280',
    [TASK_STATUSES.IN_PROGRESS]: '#3B82F6',
    [TASK_STATUSES.REVIEW]: '#F59E0B',
    [TASK_STATUSES.TESTING]: '#8B5CF6',
    [TASK_STATUSES.READY_FOR_RELEASE]: '#EC4899',
    [TASK_STATUSES.DONE]: '#10B981',
};

export const TASK_STATUS_CLASSES = {
    [TASK_STATUSES.TODO]: 'status-todo',
    [TASK_STATUSES.IN_PROGRESS]: 'status-in-progress',
    [TASK_STATUSES.REVIEW]: 'status-review',
    [TASK_STATUSES.TESTING]: 'status-testing',
    [TASK_STATUSES.READY_FOR_RELEASE]: 'status-ready',
    [TASK_STATUSES.DONE]: 'status-done',
};

export const TASK_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
};

export const TASK_PRIORITY_LABELS = {
    [TASK_PRIORITIES.LOW]: 'Низкий',
    [TASK_PRIORITIES.MEDIUM]: 'Средний',
    [TASK_PRIORITIES.HIGH]: 'Высокий',
};

export const TASK_PRIORITY_COLORS = {
    [TASK_PRIORITIES.LOW]: 'text-accent-green',
    [TASK_PRIORITIES.MEDIUM]: 'text-accent-yellow',
    [TASK_PRIORITIES.HIGH]: 'text-accent-red',
};

// Функции для работы со статусами
export function getStatusLabel(statusName) {
    return TASK_STATUS_LABELS[statusName] || statusName;
}

export function getStatusColor(statusName) {
    return TASK_STATUS_COLORS[statusName] || '#6B7280';
}

export function getStatusClass(statusName) {
    return TASK_STATUS_CLASSES[statusName] || 'status-todo';
}

export function getPriorityLabel(priority) {
    return TASK_PRIORITY_LABELS[priority] || priority;
}

export function getPriorityColor(priority) {
    return TASK_PRIORITY_COLORS[priority] || 'text-text-secondary';
}

// Получить все статусы для селекта
export function getTaskStatusOptions() {
    return Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
    }));
}

// Получить все приоритеты для селекта
export function getTaskPriorityOptions() {
    return [
        { value: '', label: 'Не указан' },
        ...Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
            value,
            label,
        })),
    ];
} 