import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { getStatusClass, getStatusLabel, getPriorityColor, getPriorityLabel } from '@/utils/statusUtils';

export default function Show({ auth, task }) {
    const [showCommentForm, setShowCommentForm] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        content: '',
        type: 'comment',
    });

    const getPriorityText = (priority) => {
        return getPriorityLabel(priority);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.comments.store', task.id), {
            onSuccess: () => {
                setData('content', '');
                setShowCommentForm(false);
            },
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
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                            <span className={`status-badge ${getStatusClass(task.status?.name)}`}>
                                {getStatusLabel(task.status?.name)}
                            </span>
                            {task.priority && (
                                <span className={getPriorityColor(task.priority)}>
                                    Приоритет: {getPriorityText(task.priority)}
                                </span>
                            )}
                            <span>Создана: {new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
                            {task.deadline && (
                                <span>Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
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

                        {/* Комментарии */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Комментарии</h3>
                                <button
                                    onClick={() => setShowCommentForm(!showCommentForm)}
                                    className="btn btn-primary btn-sm"
                                >
                                    {showCommentForm ? 'Отмена' : 'Добавить комментарий'}
                                </button>
                            </div>

                            {showCommentForm && (
                                <form onSubmit={handleCommentSubmit} className="mb-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="content" className="form-label">
                                                Комментарий
                                            </label>
                                            <textarea
                                                id="content"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                rows={3}
                                                className={`form-input ${
                                                    errors.content ? 'border-accent-red focus:ring-accent-red' : ''
                                                }`}
                                                placeholder="Введите комментарий..."
                                                required
                                            />
                                            {errors.content && (
                                                <p className="mt-1 text-sm text-accent-red">{errors.content}</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="btn btn-primary"
                                            >
                                                {processing ? 'Отправка...' : 'Отправить'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowCommentForm(false)}
                                                className="btn btn-secondary"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-4">
                                {task.comments && task.comments.length > 0 ? (
                                    task.comments.map((comment) => (
                                        <div key={comment.id} className="border border-border-color rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-text-primary">
                                                    {comment.user.name}
                                                </span>
                                                <span className="text-xs text-text-muted">
                                                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                                                </span>
                                            </div>
                                            <p className="text-text-secondary text-sm whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-text-muted text-center py-4">
                                        Комментариев пока нет
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-6">
                        {/* Детали задачи */}
                        <div className="card">
                            <h3 className="card-title mb-4">Детали задачи</h3>
                            <div className="space-y-3">
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

                                {/* Спринт */}
                                {task.sprint && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Спринт:</span>
                                        <span className="text-sm text-text-primary font-medium">
                                            {task.sprint.name}
                                        </span>
                                    </div>
                                )}

                                {/* Исполнитель */}
                                {task.assignee && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Исполнитель:</span>
                                        <span className="text-sm text-text-primary font-medium">
                                            {task.assignee.name}
                                        </span>
                                    </div>
                                )}

                                {/* Автор */}
                                {task.reporter && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Автор:</span>
                                        <span className="text-sm text-text-primary font-medium">
                                            {task.reporter.name}
                                        </span>
                                    </div>
                                )}

                                {/* Merge Request */}
                                {task.merge_request && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">MR:</span>
                                        <a
                                            href={task.merge_request}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors truncate ml-2"
                                        >
                                            Ссылка
                                        </a>
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
        </AuthenticatedLayout>
    );
} 