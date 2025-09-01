import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { getStatusClass, getStatusLabel, getPriorityColor, getPriorityLabel, getPriorityIcon } from '@/utils/statusUtils';
import TaskComments from '@/Components/TaskComments';
import TaskContentRenderer from '@/Components/TaskContentRenderer';

export default function Show({ auth, task, boardUrl }) {
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
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 break-words">{task.title}</h1>
                        {task.code && (
                            <div className="text-xs font-mono text-accent-blue mb-2 break-all">{task.code}</div>
                        )}
                        {/* Теги */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {task.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary">
                            <span className={`status-badge ${getStatusClass(task.status?.name)} flex-shrink-0`} 
                                  style={task.status?.color ? {
                                      backgroundColor: `${task.status.color}20`,
                                      color: task.status.color,
                                      border: `1px solid ${task.status.color}30`
                                  } : {}}>
                                {getStatusLabel(task.status?.name)}
                            </span>
                            {task.priority && (
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)} flex-shrink-0`}>
                                    <span>{getPriorityIcon(task.priority)}</span>
                                    <span className="hidden sm:inline">Приоритет: {getPriorityText(task.priority)}</span>
                                    <span className="sm:hidden">{getPriorityText(task.priority)}</span>
                                </span>
                            )}
                            <span className="flex-shrink-0">Код: {task.code}</span>
                            <span className="flex-shrink-0">Создана: {new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
                            {task.project?.deadline && (
                                <span className="flex-shrink-0">Дедлайн проекта: {new Date(task.project.deadline).toLocaleDateString('ru-RU')}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 lg:flex-shrink-0">
                        <Link
                            href={route('tasks.edit', task.id)}
                            className="btn btn-secondary text-center"
                        >
                            <span className="hidden sm:inline">Редактировать</span>
                            <span className="sm:hidden">Изменить</span>
                        </Link>
                        <button
                            type="button"
                            className="btn btn-danger text-center"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Удалить
                        </button>
                        <Link
                            href={route('tasks.index')}
                            className="btn btn-primary text-center"
                        >
                            <span className="hidden sm:inline">К списку</span>
                            <span className="sm:hidden">Список</span>
                        </Link>
                        {boardUrl && (
                            <Link
                                href={boardUrl}
                                className="btn btn-secondary text-center"
                            >
                                <span className="hidden sm:inline">В доску</span>
                                <span className="sm:hidden">Доска</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Основная информация */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                    <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                        {/* Описание */}
                        {task.description && (
                            <div className="card">
                                <h3 className="card-title mb-3 lg:mb-4">Описание</h3>
                                <div className="prose prose-sm max-w-none">
                                    <TaskContentRenderer content={task.description} />
                                </div>
                            </div>
                        )}

                        {/* Результат */}
                        {task.result && (
                            <div className="card">
                                <h3 className="card-title mb-3 lg:mb-4">Результат выполнения</h3>
                                <div className="prose prose-sm max-w-none">
                                    <TaskContentRenderer content={task.result} />
                                </div>
                            </div>
                        )}

                        {/* Ссылки */}
                        {task.merge_request && (
                            <div className="card">
                                <h3 className="card-title mb-3 lg:mb-4">Ссылки</h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="text-sm text-text-muted">Merge Request:</span>
                                        <a
                                            href={task.merge_request}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors break-all sm:break-normal sm:truncate sm:ml-2"
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
                            users={
                                task.project 
                                    ? [
                                        ...(task.project.owner ? [task.project.owner] : []), 
                                        ...(task.project.users || [])
                                      ].filter((user, index, array) => 
                                        array.findIndex(u => u.id === user.id) === index
                                      )
                                    : []
                            }
                            compact={false}
                        />
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-4 lg:space-y-6">
                        {/* Детали задачи */}
                        <div className="card">
                            <h3 className="card-title mb-3 lg:mb-4">Детали задачи</h3>
                            <div className="space-y-3">
                                {/* ID */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                    <span className="text-sm text-text-muted">ID:</span>
                                    <span className="text-sm text-text-primary font-medium break-all sm:break-normal">{task.id}</span>
                                </div>
                                {/* Код */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                    <span className="text-sm text-text-muted">Код:</span>
                                    <span className="text-sm text-text-primary font-medium break-all sm:break-normal">{task.code}</span>
                                </div>
                                {/* Проект */}
                                {task.project && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <span className="text-sm text-text-muted">Проект:</span>
                                        <Link
                                            href={route('projects.show', task.project.id)}
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors break-all sm:break-normal text-right sm:text-left"
                                        >
                                            {task.project.name}
                                        </Link>
                                    </div>
                                )}

                                {/* Статус проекта */}
                                {task.project && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <span className="text-sm text-text-muted">Статус проекта:</span>
                                        <span className="text-sm text-text-primary font-medium text-right sm:text-left">{getProjectStatusText(task.project.status)}</span>
                                    </div>
                                )}

                                {/* Спринт */}
                                {task.sprint && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <span className="text-sm text-text-muted">Спринт:</span>
                                        <Link
                                            href={route('sprints.show', [task.project.id, task.sprint.id])}
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors break-all sm:break-normal text-right sm:text-left"
                                        >
                                            {task.sprint.name}
                                        </Link>
                                    </div>
                                )}
                                {/* Период спринта */}
                                {task.sprint && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <span className="text-sm text-text-muted">Период спринта:</span>
                                        <span className="text-sm text-text-primary font-medium text-right sm:text-left">
                                            {new Date(task.sprint.start_date).toLocaleDateString('ru-RU')} — {new Date(task.sprint.end_date).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                )}

                                {/* Исполнитель */}
                                {task.assignee && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <span className="text-sm text-text-muted">Исполнитель:</span>
                                        <div className="flex items-center gap-2 text-right sm:text-left">
                                            {task.assignee.avatar ? (
                                                <img src={`/storage/${task.assignee.avatar}`} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-border-color" />
                                            ) : (
                                                <span className="w-7 h-7 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-bold flex items-center justify-center border border-border-color">
                                                    {task.assignee.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="block text-sm text-text-primary font-medium break-all sm:break-normal">{task.assignee.name}</span>
                                            {task.assignee.email && (
                                                <span className="block text-xs text-text-muted break-all sm:break-normal">{task.assignee.email}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Автор */}
                                {task.reporter && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <span className="text-sm text-text-muted">Автор:</span>
                                        <div className="flex items-center gap-2 text-right sm:text-left">
                                            {task.reporter.avatar ? (
                                                <img src={`/storage/${task.reporter.avatar}`} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-border-color" />
                                            ) : (
                                                <span className="w-7 h-7 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-bold flex items-center justify-center border border-border-color">
                                                    {task.reporter.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="block text-sm text-text-primary font-medium break-all sm:break-normal">{task.reporter.name}</span>
                                            {task.reporter.email && (
                                                <span className="block text-xs text-text-muted break-all sm:break-normal">{task.reporter.email}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Дедлайн проекта */}
                                {task.project?.deadline && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <span className="text-sm text-text-muted">Дедлайн проекта:</span>
                                        <span className="text-sm text-text-primary font-medium text-right sm:text-left">
                                            {new Date(task.project.deadline).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Статистика */}
                        <div className="card">
                            <h3 className="card-title mb-3 lg:mb-4">Статистика</h3>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                    <span className="text-sm text-text-muted">Комментариев:</span>
                                    <span className="text-sm text-text-primary font-medium text-right sm:text-left">
                                        {task.comments?.length || 0}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                    <span className="text-sm text-text-muted">Обновлена:</span>
                                    <span className="text-sm text-text-primary font-medium text-right sm:text-left">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card-bg border border-border-color rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-lg font-bold mb-3 sm:mb-4">Удалить задачу?</h2>
                        <p className="mb-4 sm:mb-6 text-sm sm:text-base">Вы уверены, что хотите удалить эту задачу? Это действие необратимо.</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                            <button
                                className="btn btn-secondary text-center order-2 sm:order-1"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn btn-danger text-center order-1 sm:order-2"
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