import { Link } from '@inertiajs/react';

export default function ProjectCard({ project }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-500 bg-opacity-20 text-green-400';
            case 'completed':
                return 'bg-blue-500 bg-opacity-20 text-blue-400';
            case 'on_hold':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
            case 'cancelled':
                return 'bg-red-500 bg-opacity-20 text-red-400';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Активный';
            case 'completed':
                return 'Завершен';
            case 'on_hold':
                return 'Приостановлен';
            case 'cancelled':
                return 'Отменен';
            default:
                return status;
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-medium text-green-400 mb-2">
                        <Link href={route('projects.show', project.id)} className="hover:text-green-300">
                            {project.name}
                        </Link>
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Создан: {new Date(project.created_at).toLocaleDateString('ru-RU')}</span>
                </div>

                {project.deadline && (
                    <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                    </div>
                )}

                {project.docs && project.docs.length > 0 && (
                    <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Документы: {project.docs.length}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                <div className="flex space-x-2">
                    <Link
                        href={route('projects.edit', project.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                        Редактировать
                    </Link>
                    <Link
                        href={route('projects.show', project.id)}
                        className="text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                        Просмотр
                    </Link>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    {project.tasks_count || 0} задач
                </div>
            </div>
        </div>
    );
} 