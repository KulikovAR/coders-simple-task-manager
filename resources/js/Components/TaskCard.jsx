import { Link } from '@inertiajs/react';

export default function TaskCard({ task }) {
    const getStatusColor = (statusName) => {
        switch (statusName) {
            case 'To Do':
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
            case 'In Progress':
                return 'bg-blue-500 bg-opacity-20 text-blue-400';
            case 'Review':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
            case 'Testing':
                return 'bg-purple-500 bg-opacity-20 text-purple-400';
            case 'Ready for Release':
                return 'bg-pink-500 bg-opacity-20 text-pink-400';
            case 'Done':
                return 'bg-green-500 bg-opacity-20 text-green-400';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'text-green-400';
            case 'medium':
                return 'text-yellow-400';
            case 'high':
                return 'text-red-400';
            default:
                return 'text-gray-400';
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
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {/* Статус */}
                {task.status && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Статус:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status.name)}`}>
                            {task.status.name}
                        </span>
                    </div>
                )}

                {/* Приоритет */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Приоритет:</span>
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                    </span>
                </div>

                {/* Проект */}
                {task.project && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Проект:</span>
                        <span className="text-sm text-white font-medium">
                            {task.project.name}
                        </span>
                    </div>
                )}

                {/* Исполнитель */}
                {task.assignee && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Исполнитель:</span>
                        <span className="text-sm text-white">
                            {task.assignee.name}
                        </span>
                    </div>
                )}

                {/* Комментарии */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Комментарии:</span>
                    <span className="text-sm text-white">
                        {task.comments_count || 0}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex space-x-2">
                    <Link
                        href={route('tasks.show', task.id)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                        Просмотр
                    </Link>
                    <Link
                        href={route('tasks.edit', task.id)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                        Редактировать
                    </Link>
                </div>
            </div>
        </div>
    );
} 