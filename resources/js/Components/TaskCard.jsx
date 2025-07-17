import { Link } from '@inertiajs/react';
import { getStatusClass, getPriorityColor, getPriorityLabel } from '@/utils/statusUtils';

export default function TaskCard({ task }) {
    const getPriorityText = (priority) => {
        return getPriorityLabel(priority);
    };

    return (
        <div className="card hover:shadow-glow transition-all duration-200">
            <div className="card-header">
                <div className="flex-1">
                    {task.code && (
                        <div className="text-xs font-mono text-accent-blue mb-2 font-bold">{task.code}</div>
                    )}
                    <h3 className="card-title mb-2 line-clamp-2">
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3 mb-4">
                {/* Статус */}
                {task.status && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted">Статус:</span>
                        <span className={`status-badge ${getStatusClass(task.status.name)}`}>
                            {task.status.name}
                        </span>
                    </div>
                )}

                {/* Приоритет */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Приоритет:</span>
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                    </span>
                </div>

                {/* Проект */}
                {task.project && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted">Проект:</span>
                        <span className="text-sm text-text-primary font-medium">
                            {task.project.name}
                        </span>
                    </div>
                )}

                {/* Исполнитель */}
                {task.assignee && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted">Исполнитель:</span>
                        <span className="text-sm text-text-primary font-medium">
                            {task.assignee.name}
                        </span>
                    </div>
                )}

                {/* Дедлайн */}
                {task.deadline && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted">Дедлайн:</span>
                        <span className="text-sm text-text-primary font-medium">
                            {new Date(task.deadline).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                )}
            </div>

            <div className="card-footer">
                <Link
                    href={route('tasks.show', task.id)}
                    className="btn btn-primary btn-sm w-full"
                >
                    Подробнее
                </Link>
            </div>
        </div>
    );
} 