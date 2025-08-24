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

export default function Show({ auth, project, sprint }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
                        <Link
                            href={route('sprints.statuses', [project.id, sprint.id])}
                            className="btn btn-secondary"
                        >
                            Статусы
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
                                            {sprint.tasks?.length || 0}
                                        </div>
                                        <div className="text-text-secondary">Задач</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-accent-blue mb-1">
                                            {sprint.tasks?.filter(t => t.status?.name === 'В работе').length || 0}
                                        </div>
                                        <div className="text-text-secondary">В работе</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-accent-yellow mb-1">
                                            {sprint.tasks?.filter(t => t.status?.name === 'Завершено').length || 0}
                                        </div>
                                        <div className="text-text-secondary">Завершено</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Задачи спринта */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Задачи спринта</h3>
                            </div>

                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📋</div>
                                <h3 className="text-heading-4 text-text-secondary mb-2">Управление задачами</h3>
                                <p className="text-text-muted mb-4">
                                    Просматривайте и управляйте задачами спринта
                                </p>

                                <div className="flex justify-center">
                                    <Link
                                        href={route('tasks.index', { project_id: project.id, sprint_id: sprint.id })}
                                        className="btn btn-primary"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Просмотреть все задачи
                                    </Link>
                                </div>
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


                        {/* Быстрые действия */}
                        <div className="card">
                            <h3 className="card-title mb-4">Быстрые действия</h3>
                            <div className="space-y-2">
                                <Link
                                    href={route('sprints.edit', [project.id, sprint.id])}
                                    className="btn btn-secondary btn-sm w-full"
                                >
                                    Редактировать спринт
                                </Link>
                                <Link
                                    href={route('sprints.statuses', [project.id, sprint.id])}
                                    className="btn btn-secondary btn-sm w-full"
                                >
                                    Настроить статусы
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
