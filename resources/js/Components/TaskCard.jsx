import { Link } from '@inertiajs/react';
import { getStatusClass, getPriorityColor, getPriorityLabel, getPriorityIcon } from '@/utils/statusUtils';

export default function TaskCard({ task }) {
    const getPriorityText = (priority) => {
        return getPriorityLabel(priority);
    };

    return (
        <div className="card hover:shadow-glow transition-all duration-300 group flex flex-col h-full">
            {/* Заголовок карточки */}
            <div className="flex-1 min-h-0">
                {task.code && (
                    <div className="text-caption font-mono text-accent-blue mb-3 font-bold flex items-center">
                        <span className="mr-2">🔗</span>
                        {task.code}
                    </div>
                )}
                <Link 
                    href={route('tasks.show', task.id)}
                    className="block group-hover:text-accent-blue transition-colors duration-200"
                >
                    <h3 className="card-title mb-3 line-clamp-2 hover:text-accent-blue transition-colors duration-200">
                        {task.title}
                    </h3>
                </Link>
                {task.description && (
                    <p className="text-body-small text-text-secondary mb-4 line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}
            </div>

            {/* Мета-информация */}
            <div className="space-y-3 mb-6">
                {/* Статус */}
                {task.status && (
                    <div className="flex items-center justify-between">
                        <span className="text-body-small text-text-muted font-medium">Статус:</span>
                        <span className={`status-badge ${getStatusClass(task.status.name)}`}>
                            {task.status.name}
                        </span>
                    </div>
                )}

                {/* Приоритет */}
                <div className="flex items-center justify-between">
                    <span className="text-body-small text-text-muted font-medium">Приоритет:</span>
                    <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-caption font-medium shadow-sm ${getPriorityColor(task.priority)}`}>
                        <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                        <span>{getPriorityText(task.priority)}</span>
                    </span>
                </div>

                {/* Проект */}
                {task.project && (
                    <div className="flex items-center justify-between">
                        <span className="text-body-small text-text-muted font-medium">Проект:</span>
                        <span className="text-body-small text-text-primary font-medium max-w-[60%] text-right truncate">
                            {task.project.name}
                        </span>
                    </div>
                )}

                {/* Исполнитель */}
                {task.assignee && (
                    <div className="flex items-center justify-between">
                        <span className="text-body-small text-text-muted font-medium">Исполнитель:</span>
                        <div className="flex items-center space-x-2 max-w-[60%]">
                            <div className="w-6 h-6 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-caption font-semibold text-accent-blue">
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-body-small text-text-primary font-medium truncate">
                                {task.assignee.name}
                            </span>
                        </div>
                    </div>
                )}

                {/* Дедлайн */}
                {task.deadline && (
                    <div className="flex items-center justify-between">
                        <span className="text-body-small text-text-muted font-medium">Дедлайн:</span>
                        <span className={`text-body-small font-medium ${
                            new Date(task.deadline) < new Date() 
                                ? 'text-accent-red' 
                                : 'text-text-primary'
                        }`}>
                            {new Date(task.deadline).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                )}
            </div>

            {/* Кнопка "Подробнее" - всегда внизу */}
            <div className="mt-auto pt-4 border-t border-border-color">
                <Link
                    href={route('tasks.show', task.id)}
                    className="btn btn-primary btn-sm w-full group-hover:shadow-glow-blue transition-all duration-300"
                >
                    <span className="mr-2">Подробнее</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
} 