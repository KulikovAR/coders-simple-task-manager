import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, task }) {
    const [showCommentForm, setShowCommentForm] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        content: '',
        type: 'comment',
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'todo':
                return 'status-todo';
            case 'in_progress':
                return 'status-in-progress';
            case 'review':
                return 'status-review';
            case 'done':
                return 'status-done';
            default:
                return 'status-todo';
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
                return 'text-accent-green';
            case 'medium':
                return 'text-accent-yellow';
            case 'high':
                return 'text-accent-red';
            default:
                return 'text-text-secondary';
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

    const getCommentTypeClass = (type) => {
        switch (type) {
            case 'comment':
                return 'status-in-progress';
            case 'status':
                return 'status-review';
            default:
                return 'status-todo';
        }
    };

    const getCommentTypeText = (type) => {
        switch (type) {
            case 'comment':
                return 'Комментарий';
            case 'status':
                return 'Изменение статуса';
            default:
                return type;
        }
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
                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                                {getStatusText(task.status)}
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
                            className="btn btn-primary"
                        >
                            Редактировать
                        </Link>
                        <button
                            onClick={() => setShowCommentForm(!showCommentForm)}
                            className="btn btn-success"
                        >
                            Добавить комментарий
                        </button>
                    </div>
                </div>

                {/* Основная информация */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Описание */}
                        {task.description && (
                            <div className="card">
                                <h3 className="card-title mb-3">Описание</h3>
                                <p className="text-text-secondary whitespace-pre-wrap">{task.description}</p>
                            </div>
                        )}

                        {/* Результат */}
                        {task.result && (
                            <div className="card">
                                <h3 className="card-title mb-3">Результат</h3>
                                <p className="text-text-secondary whitespace-pre-wrap">{task.result}</p>
                            </div>
                        )}

                        {/* Комментарии */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="card-title">Комментарии ({task.comments.length})</h3>
                            </div>

                            {/* Форма комментария */}
                            {showCommentForm && (
                                <div className="mb-6 p-4 bg-secondary-bg border border-border-color rounded-lg">
                                    <form onSubmit={handleCommentSubmit}>
                                        <div className="mb-4">
                                            <label className="form-label">
                                                Тип комментария
                                            </label>
                                            <select
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="comment">Комментарий</option>
                                                <option value="status">Изменение статуса</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">
                                                Содержание
                                            </label>
                                            <textarea
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                rows={3}
                                                className="form-input"
                                                placeholder="Введите комментарий..."
                                            />
                                            {errors.content && (
                                                <p className="mt-1 text-sm text-accent-red">{errors.content}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowCommentForm(false)}
                                                className="btn btn-secondary"
                                            >
                                                Отмена
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="btn btn-success"
                                            >
                                                {processing ? 'Отправка...' : 'Отправить'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Список комментариев */}
                            {task.comments.length > 0 ? (
                                <div className="space-y-4">
                                    {task.comments.map((comment) => (
                                        <div key={comment.id} className="bg-secondary-bg border border-border-color rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`status-badge ${getCommentTypeClass(comment.type)}`}>
                                                        {getCommentTypeText(comment.type)}
                                                    </span>
                                                    <span className="text-sm text-text-secondary">
                                                        {comment.user.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-text-muted">
                                                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                                                </span>
                                            </div>
                                            <p className="text-text-primary whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-text-secondary mb-2">Комментарии отсутствуют</h3>
                                    <p className="text-text-muted">Добавьте первый комментарий к задаче</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-6">
                        {/* Проект */}
                        {task.project && (
                            <div className="card">
                                <h3 className="card-title mb-3">Проект</h3>
                                <Link
                                    href={route('projects.show', task.project.id)}
                                    className="text-accent-green hover:text-green-300 font-medium transition-colors"
                                >
                                    {task.project.name}
                                </Link>
                            </div>
                        )}

                        {/* Ссылки */}
                        <div className="card">
                            <h3 className="card-title mb-3">Ссылки</h3>
                            <div className="space-y-2">
                                {task.merge_request && (
                                    <a
                                        href={task.merge_request}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-accent-blue hover:text-blue-300 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Merge Request
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 