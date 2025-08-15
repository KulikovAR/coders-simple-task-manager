import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { getStatusClass, getStatusLabel, getPriorityColor, getPriorityLabel, getPriorityIcon } from '@/utils/statusUtils';
import TaskComments from '@/Components/TaskComments';

export default function Show({ auth, task }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const getPriorityText = (priority) => {
        return getPriorityLabel(priority);
    };



    const getProjectStatusText = (status) => {
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
                return status || '—';
        }
    };



    // Удаление задачи
    const handleDelete = () => {
        router.delete(route('tasks.destroy', task.id), {
            onSuccess: () => router.visit(route('tasks.index')),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-text-primary leading-tight">Задача</h2>}
        >
            <Head title={task.title} />

            <div className="space-y-6">
                {/* Заголовок и действия */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">{task.title}</h1>
                        {task.code && (
                            <div className="text-xs font-mono text-accent-blue mb-2">{task.code}</div>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                            <span className={`status-badge ${getStatusClass(task.status?.name)}`}>
                                {getStatusLabel(task.status?.name)}
                            </span>
                            {task.priority && (
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                    <span>{getPriorityIcon(task.priority)}</span>
                                    <span>Приоритет: {getPriorityText(task.priority)}</span>
                                </span>
                            )}
                            <span>Код: {task.code}</span>
                            <span>Создана: {new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
                            {task.project?.deadline && (
                                <span>Дедлайн проекта: {new Date(task.project.deadline).toLocaleDateString('ru-RU')}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('tasks.edit', task.id)}
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
                            href={route('tasks.index')}
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
                        {task.description && (
                            <div className="card">
                                <h3 className="card-title mb-4">Описание</h3>
                                <p className="text-text-secondary whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {/* Результат */}
                        {task.result && (
                            <div className="card">
                                <h3 className="card-title mb-4">Результат выполнения</h3>
                                <p className="text-text-secondary whitespace-pre-wrap">
                                    {task.result}
                                </p>
                            </div>
                        )}

                        {/* Ссылки */}
                        {task.merge_request && (
                            <div className="card">
                                <h3 className="card-title mb-4">Ссылки</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Merge Request:</span>
                                        <a
                                            href={task.merge_request}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors truncate ml-2"
                                        >
                                            Открыть
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Комментарии */}
                        <TaskComments
                            task={task}
                            comments={task.comments || []}
                            auth={auth}
                            users={task.project?.users || []}
                            compact={false}
                        />
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-6">
                        {/* Детали задачи */}
                        <div className="card">
                            <h3 className="card-title mb-4">Детали задачи</h3>
                            <div className="space-y-3">
                                {/* ID */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">ID:</span>
                                    <span className="text-sm text-text-primary font-medium">{task.id}</span>
                                </div>
                                {/* Код */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Код:</span>
                                    <span className="text-sm text-text-primary font-medium">{task.code}</span>
                                </div>
                                {/* Проект */}
                                {task.project && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Проект:</span>
                                        <Link
                                            href={route('projects.show', task.project.id)}
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors"
                                        >
                                            {task.project.name}
                                        </Link>
                                    </div>
                                )}

                                {/* Статус проекта */}
                                {task.project && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Статус проекта:</span>
                                        <span className="text-sm text-text-primary font-medium">{getProjectStatusText(task.project.status)}</span>
                                    </div>
                                )}

                                {/* Спринт */}
                                {task.sprint && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Спринт:</span>
                                        <Link
                                            href={route('sprints.show', [task.project.id, task.sprint.id])}
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors"
                                        >
                                            {task.sprint.name}
                                        </Link>
                                    </div>
                                )}
                                {/* Период спринта */}
                                {task.sprint && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Период спринта:</span>
                                        <span className="text-sm text-text-primary font-medium">
                                            {new Date(task.sprint.start_date).toLocaleDateString('ru-RU')} — {new Date(task.sprint.end_date).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                )}

                                {/* Исполнитель */}
                                {task.assignee && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Исполнитель:</span>
                                        <span className="text-right">
                                            <span className="block text-sm text-text-primary font-medium">{task.assignee.name}</span>
                                            {task.assignee.email && (
                                                <span className="block text-xs text-text-muted">{task.assignee.email}</span>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Автор */}
                                {task.reporter && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Автор:</span>
                                        <span className="text-right">
                                            <span className="block text-sm text-text-primary font-medium">{task.reporter.name}</span>
                                            {task.reporter.email && (
                                                <span className="block text-xs text-text-muted">{task.reporter.email}</span>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Дедлайн проекта */}
                                {task.project?.deadline && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Дедлайн проекта:</span>
                                        <span className="text-sm text-text-primary font-medium">
                                            {new Date(task.project.deadline).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Статистика */}
                        <div className="card">
                            <h3 className="card-title mb-4">Статистика</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Комментариев:</span>
                                    <span className="text-sm text-text-primary font-medium">
                                        {task.comments?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-muted">Обновлена:</span>
                                    <span className="text-sm text-text-primary font-medium">
                                        {new Date(task.updated_at).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card-bg border border-border-color rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-lg font-bold mb-4">Удалить задачу?</h2>
                        <p className="mb-6">Вы уверены, что хотите удалить эту задачу? Это действие необратимо.</p>
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