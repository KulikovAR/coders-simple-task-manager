import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    getSprintStatusLabel, 
    getSprintStatusClass, 
    getSprintStatusIcon,
    formatSprintDates,
    getSprintProgress,
    isSprintActive,
    isSprintCompleted
} from '@/utils/sprintUtils';
import { getStatusClass, getStatusLabel, getPriorityColor, getPriorityLabel, getPriorityIcon } from '@/utils/statusUtils';

export default function Show({ auth, project, sprint }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const getPriorityText = (priority) => {
        return getPriorityLabel(priority);
    };

    // Удаление спринта
    const handleDelete = () => {
        router.delete(route('sprints.destroy', [project.id, sprint.id]), {
            onSuccess: () => router.visit(route('sprints.index', project.id)),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    Спринт
                </h2>
            }
        >
            <Head title={sprint.name} />

            <div className="space-y-6">
                {/* Заголовок и действия */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">{sprint.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                            <span className={`status-badge ${getSprintStatusClass(sprint.status)}`}>
                                {getSprintStatusIcon(sprint.status)} {getSprintStatusLabel(sprint.status)}
                            </span>
                            <span>Период: {formatSprintDates(sprint)}</span>
                            <span>Задач: {sprint.tasks?.length || 0}</span>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('sprints.edit', [project.id, sprint.id])}
                            className="btn btn-secondary"
                        >
                            Редактировать
                        </Link>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Удалить
                        </button>
                        <Link
                            href={route('sprints.index', project.id)}
                            className="btn btn-primary"
                        >
                            К списку
                        </Link>
                    </div>
                </div>

                {/* Основная информация */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Описание */}
                        {sprint.description && (
                            <div className="card">
                                <h3 className="card-title mb-4">Описание</h3>
                                <p className="text-text-secondary whitespace-pre-wrap">
                                    {sprint.description}
                                </p>
                            </div>
                        )}

                        {/* Прогресс */}
                        <div className="card">
                            <h3 className="card-title mb-4">Прогресс спринта</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Общий прогресс:</span>
                                    <span className="text-sm text-text-primary font-medium">
                                        {getSprintProgress(sprint)}%
                                    </span>
                                </div>
                                <div className="w-full bg-secondary-bg rounded-full h-3">
                                    <div 
                                        className="bg-accent-blue h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${getSprintProgress(sprint)}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-accent-green mb-1">
                                            {sprint.tasks?.filter(t => t.status?.name === 'Done').length || 0}
                                        </div>
                                        <div className="text-text-secondary">Завершено</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-accent-blue mb-1">
                                            {sprint.tasks?.filter(t => t.status?.name === 'In Progress').length || 0}
                                        </div>
                                        <div className="text-text-secondary">В работе</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-accent-yellow mb-1">
                                            {sprint.tasks?.filter(t => t.status?.name === 'To Do').length || 0}
                                        </div>
                                        <div className="text-text-secondary">К выполнению</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Задачи спринта */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Задачи спринта</h3>
                                <Link
                                    href={route('tasks.create', { project_id: project.id, sprint_id: sprint.id })}
                                    className="btn btn-primary btn-sm"
                                >
                                    Добавить задачу
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {sprint.tasks && sprint.tasks.length > 0 ? (
                                    sprint.tasks.map((task) => (
                                        <div key={task.id} className="border border-border-color rounded-lg p-4 hover:bg-secondary-bg/50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-white font-medium">
                                                            <Link 
                                                                href={route('tasks.show', task.id)} 
                                                                className="hover:text-accent-blue transition-colors"
                                                            >
                                                                {task.title}
                                                            </Link>
                                                        </h4>
                                                        <span className={`status-badge ${getStatusClass(task.status?.name)}`}>
                                                            {getStatusLabel(task.status?.name)}
                                                        </span>
                                                    </div>
                                                    
                                                    {task.description && (
                                                        <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center space-x-4 text-sm text-text-muted">
                                                        {task.priority && (
                                                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                                <span>{getPriorityIcon(task.priority)}</span>
                                                                <span>Приоритет: {getPriorityText(task.priority)}</span>
                                                            </span>
                                                        )}
                                                        {task.assignee && (
                                                            <span>Исполнитель: {task.assignee.name}</span>
                                                        )}
                                                        {task.deadline && (
                                                            <span>Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex space-x-2 ml-4">
                                                    <Link
                                                        href={route('tasks.show', task.id)}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Просмотр
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4">📋</div>
                                        <h3 className="text-lg font-medium text-text-secondary mb-2">
                                            Задачи отсутствуют
                                        </h3>
                                        <p className="text-text-muted mb-4">
                                            Добавьте задачи в этот спринт
                                        </p>
                                        <Link
                                            href={route('tasks.create', { project_id: project.id, sprint_id: sprint.id })}
                                            className="btn btn-primary"
                                        >
                                            Добавить задачу
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-6">
                        {/* Детали спринта */}
                        <div className="card">
                            <h3 className="card-title mb-4">Детали спринта</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Проект:</span>
                                    <Link
                                        href={route('projects.show', project.id)}
                                        className="text-sm text-accent-blue hover:text-accent-green transition-colors"
                                    >
                                        {project.name}
                                    </Link>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Дата начала:</span>
                                    <span className="text-sm text-text-primary font-medium">
                                        {new Date(sprint.start_date).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Дата окончания:</span>
                                    <span className="text-sm text-text-primary font-medium">
                                        {new Date(sprint.end_date).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Длительность:</span>
                                    <span className="text-sm text-text-primary font-medium">
                                        {Math.ceil((new Date(sprint.end_date) - new Date(sprint.start_date)) / (1000 * 60 * 60 * 24))} дней
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Статистика */}
                        <div className="card">
                            <h3 className="card-title mb-4">Статистика</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Всего задач:</span>
                                    <span className="text-sm text-text-primary font-medium">
                                        {sprint.tasks?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Завершено:</span>
                                    <span className="text-sm text-accent-green font-medium">
                                        {sprint.tasks?.filter(t => t.status?.name === 'Done').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">В работе:</span>
                                    <span className="text-sm text-accent-blue font-medium">
                                        {sprint.tasks?.filter(t => t.status?.name === 'In Progress').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">К выполнению:</span>
                                    <span className="text-sm text-accent-yellow font-medium">
                                        {sprint.tasks?.filter(t => t.status?.name === 'To Do').length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Быстрые действия */}
                        <div className="card">
                            <h3 className="card-title mb-4">Быстрые действия</h3>
                            <div className="space-y-2">
                                <Link
                                    href={route('tasks.create', { project_id: project.id, sprint_id: sprint.id })}
                                    className="btn btn-primary btn-sm w-full"
                                >
                                    Добавить задачу
                                </Link>
                                <Link
                                    href={route('sprints.edit', [project.id, sprint.id])}
                                    className="btn btn-secondary btn-sm w-full"
                                >
                                    Редактировать спринт
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Удалить спринт?</h2>
                        <p className="mb-6">Вы уверены, что хотите удалить этот спринт? Это действие необратимо. Все задачи спринта останутся в проекте.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
} 