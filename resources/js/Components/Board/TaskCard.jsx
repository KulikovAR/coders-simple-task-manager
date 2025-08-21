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
    openTaskModal
}) {
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
            {/* Код задачи */}
            {task.code && (
                <div className="text-caption font-mono text-accent-blue mb-3 font-bold flex items-center bg-accent-blue/5 px-2 py-1 rounded-lg inline-block">
                    <span className="mr-2">🔗</span>
                    {task.code}
                </div>
            )}

            {/* Заголовок задачи */}
            <div className="flex justify-between items-start mb-4">
                <h5 className="text-text-primary font-semibold text-body leading-tight">
                    <a
                        href={route('tasks.show', task.id)}
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
                        <div className="w-6 h-6 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                            <span className="text-caption font-semibold text-accent-blue">
                                {task.assignee.name.charAt(0).toUpperCase()}
                            </span>
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
