import { Link } from '@inertiajs/react';

export default function TaskCard({
    task,
    project,
    draggedTask,
    longPressTriggeredRef,
    handleDragStart,
    handleDragEnd,
    handleTaskTouchStart,
    handleTaskTouchMove,
    handleTaskTouchEnd,
    openTaskModal,
    viewMode
}) {
    // Функция для копирования ссылки на задачу
    const copyTaskLink = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const taskUrl = task.code ? route('tasks.show.by-code', task.code) : route('tasks.show', task.id);
        navigator.clipboard.writeText(taskUrl)
            .then(() => {
                // Показываем временное уведомление, проверяя наличие элемента
                const element = e.currentTarget;
                if (element) {
                    const originalText = element.textContent || task.code;

                    // Сохраняем оригинальное содержимое
                    const originalContent = element.innerHTML;

                    // Заменяем содержимое на уведомление о копировании
                    element.innerHTML = '<span>Скопировано!</span>';

                    setTimeout(() => {
                        // Проверяем, существует ли еще элемент перед восстановлением
                        if (element && element.isConnected) {
                            element.innerHTML = originalContent;
                        }
                    }, 1500);
                }
            })
            .catch(err => {
                console.error('Ошибка при копировании: ', err);
            });
    };
    const getPriorityText = (priority) => {
        switch (priority) {
            case 'low':
                return 'Низкий';
            case 'medium':
                return 'Средний';
            case 'high':
                return 'Высокий';
            default:
                return priority;
        }
    };

    // Компактный списочный вид
    if (viewMode === 'list') {
        return (
            <div
                className={`task-card bg-card-bg border rounded-lg p-3 cursor-move hover:bg-secondary-bg hover:border-accent-blue/30 shadow-sm hover:shadow-md transition-all duration-200 ${
                    draggedTask?.id === task.id ? 'dragging opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                    if (longPressTriggeredRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    openTaskModal(task);
                }}
                onTouchStart={(e) => handleTaskTouchStart(e, task)}
                onTouchMove={handleTaskTouchMove}
                onTouchEnd={handleTaskTouchEnd}
            >
                <div className="flex items-center justify-between gap-3">
                    {/* Левая часть: код, заголовок и основная информация */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {/* Код задачи с возможностью копирования */}
                            {task.code && (
                                <span
                                    className="text-xs font-mono text-accent-blue bg-accent-blue/5 px-2 py-0.5 rounded font-bold flex-shrink-0 cursor-pointer hover:bg-accent-blue/10 transition-colors inline-flex items-center"
                                    onClick={copyTaskLink}
                                    title="Нажмите, чтобы скопировать ссылку на задачу"
                                >
                                    <span className="mr-1">🔗</span>
                                    {task.code}
                                </span>
                            )}
                            {/* Заголовок задачи */}
                            <h5 className="text-text-primary font-medium text-sm leading-tight truncate">
                                <a
                                    href={task.code ? route('tasks.show.by-code', task.code) : route('tasks.show', task.id)}
                                    className="hover:text-accent-blue transition-colors duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {task.title}
                                </a>
                            </h5>
                        </div>

                        {/* Вторая строка: теги */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                                {task.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-accent-blue/10 text-accent-blue"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {task.tags.length > 3 && (
                                    <span className="text-xs text-text-muted">+{task.tags.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Правая часть: приоритет, дедлайн, исполнитель */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Приоритет */}
                        {task.priority && (
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                task.priority === 'high'
                                    ? 'bg-accent-red/20 text-accent-red'
                                    : task.priority === 'medium'
                                        ? 'bg-accent-yellow/20 text-accent-yellow'
                                        : 'bg-accent-green/20 text-accent-green'
                            }`}>
                                <span className="text-xs mr-1">
                                    {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                                </span>
                            </div>
                        )}

                        {/* Дедлайн */}
                        {task.deadline && task.deadline !== '0000-00-00' && (
                            <div className={`flex items-center text-xs px-2 py-1 rounded ${
                                new Date(task.deadline) < new Date()
                                    ? 'bg-accent-red/10 text-accent-red font-medium'
                                    : 'text-text-secondary bg-secondary-bg'
                            }`}>
                                <span className="mr-1">{new Date(task.deadline) < new Date() ? '⚠️' : '📅'}</span>
                                <span className="hidden sm:inline">
                                    {new Date(task.deadline).toLocaleDateString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}

                        {/* Исполнитель */}
                        {task.assignee && (
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-accent-blue/20 rounded-lg flex items-center justify-center overflow-hidden">
                                    {task.assignee.avatar ? (
                                        <img src={`/storage/${task.assignee.avatar}`} alt="avatar" className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-xs font-semibold text-accent-blue">
                                            {task.assignee.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Компактная доска - код сверху, остальное снизу
    if (viewMode === 'compact-board') {
        return (
            <div
                className={`task-card bg-card-bg border rounded-lg p-3 cursor-move hover:bg-secondary-bg hover:border-accent-blue/30 shadow-sm hover:shadow-md transition-all duration-200 ${
                    draggedTask?.id === task.id ? 'dragging opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                    if (longPressTriggeredRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    openTaskModal(task);
                }}
                onTouchStart={(e) => handleTaskTouchStart(e, task)}
                onTouchMove={handleTaskTouchMove}
                onTouchEnd={handleTaskTouchEnd}
            >
                {/* Первая строка: код задачи с возможностью копирования */}
                {task.code && (
                    <div className="mb-2">
                        <span
                            className="text-xs font-mono text-accent-blue bg-accent-blue/5 px-2 py-0.5 rounded font-bold cursor-pointer hover:bg-accent-blue/10 transition-colors inline-flex items-center"
                            onClick={copyTaskLink}
                            title="Нажмите, чтобы скопировать ссылку на задачу"
                        >
                            <span className="mr-1">🔗</span>
                            {task.code}
                        </span>
                    </div>
                )}

                {/* Вторая строка: заголовок и мета-информация */}
                <div className="flex items-center justify-between gap-3">
                    {/* Левая часть: заголовок и теги */}
                    <div className="flex-1 min-w-0">
                        {/* Заголовок задачи */}
                        <h5 className="text-text-primary font-medium text-sm leading-tight truncate mb-1">
                            <a
                                href={task.code ? route('tasks.show.by-code', task.code) : route('tasks.show', task.id)}
                                className="hover:text-accent-blue transition-colors duration-200"
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {task.title}
                            </a>
                        </h5>

                        {/* Теги */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {task.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-accent-blue/10 text-accent-blue"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {task.tags.length > 2 && (
                                    <span className="text-xs text-text-muted">+{task.tags.length - 2}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Правая часть: приоритет, дедлайн, исполнитель */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Приоритет */}
                        {task.priority && (
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                task.priority === 'high'
                                    ? 'bg-accent-red/20 text-accent-red'
                                    : task.priority === 'medium'
                                        ? 'bg-accent-yellow/20 text-accent-yellow'
                                        : 'bg-accent-green/20 text-accent-green'
                            }`}>
                                <span className="text-xs mr-1">
                                    {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                                </span>
                            </div>
                        )}

                        {/* Дедлайн */}
                        {task.deadline && task.deadline !== '0000-00-00' && (
                            <div className={`flex items-center text-xs px-2 py-1 rounded ${
                                new Date(task.deadline) < new Date()
                                    ? 'bg-accent-red/10 text-accent-red font-medium'
                                    : 'text-text-secondary bg-secondary-bg'
                            }`}>
                                <span className="mr-1">{new Date(task.deadline) < new Date() ? '⚠️' : '📅'}</span>
                                <span className="hidden sm:inline">
                                    {new Date(task.deadline).toLocaleDateString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}

                        {/* Исполнитель */}
                        {task.assignee && (
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-accent-blue/20 rounded-lg flex items-center justify-center overflow-hidden">
                                    {task.assignee.avatar ? (
                                        <img src={`/storage/${task.assignee.avatar}`} alt="avatar" className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-xs font-semibold text-accent-blue">
                                            {task.assignee.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Обычный карточный вид
    return (
        <div
            className={`task-card bg-card-bg border rounded-xl p-5 cursor-move hover:bg-secondary-bg hover:border-accent-blue/30 shadow-md hover:shadow-lg transition-all duration-300 ${
                draggedTask?.id === task.id ? 'dragging opacity-50' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
                // Предотвращаем открытие модалки, если только что был лонгтап
                if (longPressTriggeredRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                openTaskModal(task);
            }}
            onTouchStart={(e) => handleTaskTouchStart(e, task)}
            onTouchMove={handleTaskTouchMove}
            onTouchEnd={handleTaskTouchEnd}
        >
            {/* Код задачи с возможностью копирования ссылки */}
            {task.code && (
                <div
                    className="text-caption font-mono text-accent-blue mb-3 font-bold flex items-center bg-accent-blue/5 px-2 py-1 rounded-lg inline-block cursor-pointer hover:bg-accent-blue/10 transition-colors"
                    onClick={copyTaskLink}
                    title="Нажмите, чтобы скопировать ссылку на задачу"
                >
                    <span className="mr-2">🔗</span>
                    {task.code}
                </div>
            )}

            {/* Заголовок задачи */}
            <div className="flex justify-between items-start mb-4">
                <h5 className="text-text-primary font-semibold text-body leading-tight">
                    <a
                        href={task.code ? route('tasks.show.by-code', task.code) : route('tasks.show', task.id)}
                        className="hover:text-accent-blue transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {task.title}
                    </a>
                </h5>
            </div>

            {/* Статус задачи */}
            {task.status && (
                <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium shadow-md"
                          style={task.status.color ? {
                              backgroundColor: `${task.status.color}20`,
                              color: task.status.color,
                              border: `1px solid ${task.status.color}30`
                          } : {}}>
                        {task.status.name}
                    </span>
                </div>
            )}

            {/* Теги */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {task.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Мета-информация */}
            <div className="space-y-3 mt-2">
                {/* Верхняя строка: приоритет и дедлайн */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Приоритет с цветным фоном */}
                    {task.priority && (
                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-caption font-medium shadow-md ${
                            task.priority === 'high'
                                ? 'bg-accent-red/20 text-accent-red border border-accent-red/30'
                                : task.priority === 'medium'
                                    ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                                    : 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                        }`}>
                            <span className="text-sm">
                                {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                            </span>
                            <span>{getPriorityText(task.priority)}</span>
                        </div>
                    )}

                    {/* Дедлайн с предупреждением */}
                    {task.deadline && task.deadline !== '0000-00-00' && (
                        <div className={`flex items-center space-x-2 text-caption px-3 py-1.5 rounded-lg ${
                            new Date(task.deadline) < new Date()
                                ? 'bg-accent-red/10 text-accent-red font-medium border border-accent-red/30'
                                : 'text-text-secondary'
                        }`}>
                            <span>{new Date(task.deadline) < new Date() ? '⚠️' : '📅'}</span>
                            <span>
                                {new Date(task.deadline).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Исполнитель */}
                {task.assignee && (
                    <div className="flex items-center space-x-2 text-caption text-text-secondary">
                        <div className="w-6 h-6 bg-accent-blue/20 rounded-lg flex items-center justify-center overflow-hidden">
                            {task.assignee.avatar ? (
                                <img src={`/storage/${task.assignee.avatar}`} alt="avatar" className="object-cover w-full h-full" />
                            ) : (
                                <span className="text-caption font-semibold text-accent-blue">
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="font-medium">{task.assignee.name}</span>
                    </div>
                )}
            </div>

            {/* Информация о спринте */}
            {task.sprint && (
                <div className="mt-4 pt-3 border-t border-border-color">
                    <div className="flex items-center justify-between text-caption bg-secondary-bg/50 px-3 py-2 rounded-lg">
                        <span className="text-text-secondary flex items-center">
                            <span className="mr-2">🏃</span>
                            Спринт:
                        </span>
                        <Link
                            href={route('sprints.show', [project.id, task.sprint.id])}
                            className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-200 font-medium"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {task.sprint.name}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
