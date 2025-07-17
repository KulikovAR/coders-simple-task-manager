import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    getSprintStatusLabel, 
    getSprintStatusClass, 
    getSprintStatusIcon,
    formatSprintDates,
    getSprintProgress,
    isSprintActive,
    isSprintCompleted
} from '@/utils/sprintUtils';

export default function Index({ auth, project, sprints }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    Спринты проекта
                </h2>
            }
        >
            <Head title={`Спринты - ${project.name}`} />

            <div className="space-y-6">
                {/* Заголовок и действия */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">
                            Спринты проекта "{project.name}"
                        </h1>
                        <p className="text-text-secondary">
                            Управление спринтами и их задачами
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('projects.show', project.id)}
                            className="btn btn-secondary"
                        >
                            К проекту
                        </Link>
                        <Link
                            href={route('sprints.create', project.id)}
                            className="btn btn-primary"
                        >
                            Создать спринт
                        </Link>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-text-primary mb-1">
                                {sprints.length}
                            </div>
                            <div className="text-sm text-text-secondary">Всего спринтов</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-blue mb-1">
                                {sprints.filter(s => s.status === 'active').length}
                            </div>
                            <div className="text-sm text-text-secondary">Активных</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-green mb-1">
                                {sprints.filter(s => s.status === 'completed').length}
                            </div>
                            <div className="text-sm text-text-secondary">Завершенных</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-yellow mb-1">
                                {sprints.filter(s => s.status === 'planned').length}
                            </div>
                            <div className="text-sm text-text-secondary">Запланированных</div>
                        </div>
                    </div>
                </div>

                {/* Список спринтов */}
                <div className="space-y-4">
                    {sprints.length > 0 ? (
                        sprints.map((sprint) => (
                            <div key={sprint.id} className="card hover:shadow-glow transition-all duration-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="text-lg font-semibold text-text-primary">
                                                <Link 
                                                    href={route('sprints.show', [project.id, sprint.id])}
                                                    className="hover:text-accent-blue transition-colors"
                                                >
                                                    {sprint.name}
                                                </Link>
                                            </h3>
                                            <span className={`status-badge ${getSprintStatusClass(sprint.status)}`}>
                                                {getSprintStatusIcon(sprint.status)} {getSprintStatusLabel(sprint.status)}
                                            </span>
                                        </div>
                                        
                                        {sprint.description && (
                                            <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                                                {sprint.description}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-text-muted">Период:</span>
                                                <div className="text-text-primary font-medium">
                                                    {formatSprintDates(sprint)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-text-muted">Задач:</span>
                                                <div className="text-text-primary font-medium">
                                                    {sprint.tasks?.length || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-text-muted">Прогресс:</span>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 bg-secondary-bg rounded-full h-2">
                                                        <div 
                                                            className="bg-accent-blue h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${getSprintProgress(sprint)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-text-primary font-medium text-xs">
                                                        {getSprintProgress(sprint)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-2 ml-4">
                                        <Link
                                            href={route('sprints.show', [project.id, sprint.id])}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Просмотр
                                        </Link>
                                        <Link
                                            href={route('sprints.edit', [project.id, sprint.id])}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Редактировать
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card">
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📅</div>
                                <h3 className="text-lg font-medium text-text-secondary mb-2">
                                    Спринты отсутствуют
                                </h3>
                                <p className="text-text-muted mb-4">
                                    Создайте первый спринт для планирования работы
                                </p>
                                <Link
                                    href={route('sprints.create', project.id)}
                                    className="btn btn-primary"
                                >
                                    Создать спринт
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 