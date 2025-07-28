// Функция для получения текста уведомления
export const getNotificationText = (notification) => {
    const messages = {
        'task_assigned': `Вам назначена задача: ${notification.data?.task_title || 'Неизвестная задача'}`,
        'task_moved': `Задача "${notification.data?.task_title || 'Неизвестная задача'}" перемещена в статус "${notification.data?.status || 'неизвестный статус'}"`,
        'task_created': `Создана новая задача: ${notification.data?.task_title || 'Неизвестная задача'}`,
        'task_updated': `Задача "${notification.data?.task_title || 'Неизвестная задача'}" обновлена`,
        'task_priority_changed': `Приоритет задачи "${notification.data?.task_title || 'Неизвестная задача'}" изменен на "${notification.data?.priority || 'неизвестный приоритет'}"`,
        'comment_added': `Добавлен комментарий к задаче "${notification.data?.task_title || 'Неизвестная задача'}"`,
        'sprint_started': `Спринт "${notification.data?.sprint_name || 'Неизвестный спринт'}" начался`,
        'sprint_ended': `Спринт "${notification.data?.sprint_name || 'Неизвестный спринт'}" завершён`,
        'project_invited': `Вас пригласили в проект "${notification.data?.project_name || 'Неизвестный проект'}"`,
        'deadline_approaching': `Дедлайн задачи "${notification.data?.task_title || 'Неизвестная задача'}" приближается`,
        'deadline_overdue': `Дедлайн задачи "${notification.data?.task_title || 'Неизвестная задача'}" просрочен`,
    };

    // Если есть сообщение в модели уведомления, используем его
    if (notification.message) {
        return notification.message;
    }

    // Если есть связанный объект, пытаемся получить информацию из него
    if (notification.notifiable) {
        const notifiable = notification.notifiable;
        
        switch (notification.type) {
            case 'task_assigned':
            case 'task_moved':
            case 'task_created':
            case 'task_updated':
            case 'task_priority_changed':
            case 'comment_added':
            case 'deadline_approaching':
            case 'deadline_overdue':
                return messages[notification.type]?.replace('Неизвестная задача', notifiable.title || 'Задача') || 'Обновление задачи';
            
            case 'sprint_started':
            case 'sprint_ended':
                return messages[notification.type]?.replace('Неизвестный спринт', notifiable.name || 'Спринт') || 'Обновление спринта';
            
            case 'project_invited':
                return messages[notification.type]?.replace('Неизвестный проект', notifiable.name || 'Проект') || 'Приглашение в проект';
        }
    }

    return messages[notification.type] || 'Новое уведомление';
};

// Функция для получения иконки уведомления
export const getNotificationIcon = (type) => {
    const icons = {
        'task_assigned': '🎯',
        'task_moved': '🔄',
        'task_created': '➕',
        'task_updated': '✏️',
        'comment_added': '💬',
        'sprint_started': '🏃',
        'sprint_ended': '🏁',
        'project_invited': '👥',
        'deadline_approaching': '⏰',
        'deadline_overdue': '🚨',
    };

    return icons[type] || '🔔';
};

// Функция для получения цвета уведомления
export const getNotificationColor = (type) => {
    const colors = {
        'task_assigned': 'text-blue-500',
        'task_moved': 'text-green-500',
        'task_created': 'text-purple-500',
        'task_updated': 'text-yellow-500',
        'comment_added': 'text-indigo-500',
        'sprint_started': 'text-green-500',
        'sprint_ended': 'text-red-500',
        'project_invited': 'text-blue-500',
        'deadline_approaching': 'text-orange-500',
        'deadline_overdue': 'text-red-500',
    };

    return colors[type] || 'text-gray-500';
};

// Функция для получения ссылки на связанный объект
export const getNotificationLink = (notification) => {
    try {
        // Если есть связанный объект, используем его
        if (notification.notifiable) {
            const notifiable = notification.notifiable;
            
            if (notification.notifiable_type === 'App\\Models\\Task') {
                return route('tasks.show', notifiable.id);
            } else if (notification.notifiable_type === 'App\\Models\\Project') {
                return route('projects.show', notifiable.id);
            } else if (notification.notifiable_type === 'App\\Models\\Sprint') {
                return route('sprints.show', notifiable.id);
            } else if (notification.notifiable_type === 'App\\Models\\TaskComment') {
                return route('tasks.show', notifiable.task_id);
            }
        }
        
        // Если связанного объекта нет, но есть ID, пытаемся создать ссылку
        if (notification.notifiable_id) {
            if (notification.notifiable_type === 'App\\Models\\Task') {
                return route('tasks.show', notification.notifiable_id);
            } else if (notification.notifiable_type === 'App\\Models\\Project') {
                return route('projects.show', notification.notifiable_id);
            } else if (notification.notifiable_type === 'App\\Models\\Sprint') {
                return route('sprints.show', notification.notifiable_id);
            }
        }
        
        // Для комментариев пытаемся получить task_id из данных
        if (notification.notifiable_type === 'App\\Models\\TaskComment' && notification.data?.task_id) {
            return route('tasks.show', notification.data.task_id);
        }
        
        return null;
    } catch (error) {
        console.error('Ошибка создания ссылки для уведомления:', error);
        return null;
    }
};

// Функция для форматирования даты уведомления
export const formatNotificationDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Функция для форматирования даты уведомления с годом
export const formatNotificationDateWithYear = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}; 