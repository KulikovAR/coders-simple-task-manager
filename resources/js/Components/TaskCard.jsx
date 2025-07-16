import { Link } from '@inertiajs/react';

export default function TaskCard({ task }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'todo':
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
            case 'in_progress':
                return 'bg-blue-500 bg-opacity-20 text-blue-400';
            case 'review':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
            case 'done':
                return 'bg-green-500 bg-opacity-20 text-green-400';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'todo':
                return 'К выполнению';
            case 'in_progress':
                return 'В работе';
            case 'review':
                return 'На проверке';
            case 'done':
                return 'Завершена';
            default:
                return status;
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
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-blue-400 mb-2">
                        <Link href={route('tasks.show', task.id)} className="hover:text-blue-300">
                            {task.title}
                        </Link>
                    </h3>
                    {task.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                    )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                </span>
            </div>

            <div className="space-y-3">
                {task.project && (
                    <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <Link href={route('projects.show', task.project.id)} className="text-green-400 hover:text-green-300">
                            {task.project.name}
                        </Link>
                    </div>
                )}

                <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Создана: {new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
                </div>

                {task.deadline && (
                    <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                    </div>
                )}

                {task.priority && (
                    <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className={getPriorityColor(task.priority)}>Приоритет: {getPriorityText(task.priority)}</span>
                    </div>
                )}

                {task.merge_request && (
                    <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <a href={task.merge_request} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            Merge Request
                        </a>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                <div className="flex space-x-2">
                    <Link
                        href={route('tasks.edit', task.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                        Редактировать
                    </Link>
                    <Link
                        href={route('tasks.show', task.id)}
                        className="text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                        Просмотр
                    </Link>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {task.comments_count || 0} комментариев
                </div>
            </div>
        </div>
    );
} 