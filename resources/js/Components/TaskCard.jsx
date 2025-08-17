import { Link } from '@inertiajs/react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import HtmlRenderer from '@/Components/HtmlRenderer';

export default function TaskCard({ task }) {

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
                {/* Убираем отображение описания */}
            </div>

            {/* Мета-информация */}
            <div className="space-y-3 mb-6">
                {/* Статус */}
                {task.status && (
                    <div className="flex items-center justify-between">
                        <span className="text-body-small text-text-muted font-medium">Статус:</span>
                        <StatusBadge status={task.status} />
                    </div>
                )}

                {/* Приоритет */}
                <div className="flex items-center justify-between">
                    <span className="text-body-small text-text-muted font-medium">Приоритет:</span>
                    <PriorityBadge priority={task.priority} />
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
