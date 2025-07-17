import { Link } from '@inertiajs/react';

export default function TaskCard({ task }) {
    const getStatusClass = (statusName) => {
        switch (statusName) {
            case 'To Do':
                return 'status-todo';
            case 'In Progress':
                return 'status-in-progress';
            case 'Review':
                return 'status-review';
            case 'Testing':
                return 'status-testing';
            case 'Ready for Release':
                return 'status-ready';
            case 'Done':
                return 'status-done';
            default:
                return 'status-todo';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'text-accent-green';
            case 'medium':
                return 'text-accent-yellow';
            case 'high':
                return 'text-accent-red';
            default:
                return 'text-text-secondary';
        }
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

    return (
        <div className="card hover:shadow-glow transition-all duration-200">
            <div className="card-header">
                <div className="flex-1">
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
                        <span className="text-sm text-text-primary">
                            {task.assignee.name}
                        </span>
                    </div>
                )}

                {/* Комментарии */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Комментарии:</span>
                    <span className="text-sm text-text-primary">
                        {task.comments_count || 0}
                    </span>
                </div>
            </div>

            <div className="pt-4 border-t border-border-color">
                <div className="flex space-x-2">
                    <Link
                        href={route('tasks.show', task.id)}
                        className="btn btn-primary flex-1 text-center"
                    >
                        Просмотр
                    </Link>
                    <Link
                        href={route('tasks.edit', task.id)}
                        className="btn btn-secondary flex-1 text-center"
                    >
                        Редактировать
                    </Link>
                </div>
            </div>
        </div>
    );
} 