import { Link } from '@inertiajs/react';
import StatusBadge from './StatusBadge';

export default function ProjectCard({ project }) {
    const getStatusClass = (status) => {
        switch (status) {
            case 'active':
                return 'status-active';
            case 'completed':
                return 'status-completed';
            case 'on_hold':
                return 'status-on-hold';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-todo';
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

    // Функция для правильного склонения слова "задача"
    const getTaskCountText = (count) => {
        const num = count || 0;
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${num} задач`;
        }

        if (lastDigit === 1) {
            return `${num} задача`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${num} задачи`;
        } else {
            return `${num} задач`;
        }
    };

    return (
        <div className="card hover:shadow-glow transition-all duration-200 h-full flex flex-col">
            <div className="card-header">
                <div className="flex-1">
                    <h3 className="card-title mb-2">
                        <Link href={route('projects.show', project.id)} className="hover:text-accent-green transition-colors">
                            {project.name}
                        </Link>
                    </h3>
                </div>
                <span className={`status-badge ${getStatusClass(project.status)}`}>
                    {getStatusText(project.status)}
                </span>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-text-secondary">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Создан: {new Date(project.created_at).toLocaleDateString('ru-RU')}</span>
                </div>

                {project.deadline && (
                    <div className="flex items-center text-sm text-text-secondary">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                    </div>
                )}

                {project.docs && project.docs.length > 0 && (
                    <div className="flex items-center text-sm text-text-secondary">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Документы: {project.docs.length}</span>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-border-color mt-auto">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                        <Link
                            href={route('projects.edit', project.id)}
                            className="text-accent-blue hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                            Редактировать
                        </Link>
                        <Link
                            href={route('projects.show', project.id)}
                            className="text-accent-green hover:text-green-300 text-sm font-medium transition-colors"
                        >
                            Просмотр
                        </Link>
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        {getTaskCountText(project.tasks_count)}
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Link
                        href={route('projects.board', project.id)}
                        className="btn btn-primary flex-1 text-center"
                    >
                        Доска
                    </Link>
                    <Link
                        href={route('projects.gantt', project.id)}
                        className="btn btn-accent flex-1 text-center"
                    >
                        Гантт
                    </Link>
                    <Link
                        href={route('projects.show', project.id)}
                        className="btn btn-secondary flex-1 text-center"
                    >
                        Детали
                    </Link>
                </div>
            </div>
        </div>
    );
}
