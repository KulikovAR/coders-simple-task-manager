// Утилиты для работы со спринтами

export const SPRINT_STATUSES = {
    PLANNED: 'planned',
    ACTIVE: 'active',
    COMPLETED: 'completed',
};

export const SPRINT_STATUS_LABELS = {
    [SPRINT_STATUSES.PLANNED]: 'Запланирован',
    [SPRINT_STATUSES.ACTIVE]: 'Активный',
    [SPRINT_STATUSES.COMPLETED]: 'Завершен',
};

export const SPRINT_STATUS_COLORS = {
    [SPRINT_STATUSES.PLANNED]: '#6B7280',
    [SPRINT_STATUSES.ACTIVE]: '#3B82F6',
    [SPRINT_STATUSES.COMPLETED]: '#10B981',
};

export const SPRINT_STATUS_CLASSES = {
    [SPRINT_STATUSES.PLANNED]: 'status-todo',
    [SPRINT_STATUSES.ACTIVE]: 'status-in-progress',
    [SPRINT_STATUSES.COMPLETED]: 'status-done',
};

export const SPRINT_STATUS_ICONS = {
    [SPRINT_STATUSES.PLANNED]: '📅',
    [SPRINT_STATUSES.ACTIVE]: '🚀',
    [SPRINT_STATUSES.COMPLETED]: '✅',
};

// Функции для работы со спринтами
export function getSprintStatusLabel(status) {
    return SPRINT_STATUS_LABELS[status] || status;
}

export function getSprintStatusColor(status) {
    return SPRINT_STATUS_COLORS[status] || '#6B7280';
}

export function getSprintStatusClass(status) {
    return SPRINT_STATUS_CLASSES[status] || 'status-todo';
}

export function getSprintStatusIcon(status) {
    return SPRINT_STATUS_ICONS[status] || '📅';
}

// Получить все статусы для селекта
export function getSprintStatusOptions() {
    return Object.entries(SPRINT_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
        icon: SPRINT_STATUS_ICONS[value],
    }));
}

// Проверить, активен ли спринт
export function isSprintActive(sprint) {
    if (!sprint) return false;
    
    const today = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    
    return today >= startDate && today <= endDate && sprint.status === SPRINT_STATUSES.ACTIVE;
}

// Проверить, завершен ли спринт
export function isSprintCompleted(sprint) {
    return sprint?.status === SPRINT_STATUSES.COMPLETED;
}

// Проверить, запланирован ли спринт
export function isSprintPlanned(sprint) {
    return sprint?.status === SPRINT_STATUSES.PLANNED;
}

// Получить прогресс спринта (в днях)
export function getSprintProgress(sprint) {
    if (!sprint || !sprint.start_date || !sprint.end_date) return 0;
    
    const today = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
    
    return Math.round((elapsedDays / totalDays) * 100);
}

// Форматировать даты спринта
export function formatSprintDates(sprint) {
    if (!sprint) return '';
    
    const startDate = new Date(sprint.start_date).toLocaleDateString('ru-RU');
    const endDate = new Date(sprint.end_date).toLocaleDateString('ru-RU');
    
    return `${startDate} - ${endDate}`;
} 