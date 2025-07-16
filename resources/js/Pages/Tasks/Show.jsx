import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, task }) {
    const [showCommentForm, setShowCommentForm] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        content: '',
        type: 'comment',
    });

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

    const getCommentTypeColor = (type) => {
        switch (type) {
            case 'comment':
                return 'bg-blue-500 bg-opacity-20 text-blue-400';
            case 'status':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
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
            header={<h2 className="font-semibold text-xl text-green-400 leading-tight">Задача</h2>}
        >
            <Head title={task.title} />

            <div className="space-y-6">
                {/* Заголовок и действия */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-400 mb-2">{task.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Редактировать
                        </Link>
                        <button
                            onClick={() => setShowCommentForm(!showCommentForm)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-blue-400 mb-3">Описание</h3>
                                <p className="text-gray-400 whitespace-pre-wrap">{task.description}</p>
                            </div>
                        )}

                        {/* Результат */}
                        {task.result && (
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-green-400 mb-3">Результат</h3>
                                <p className="text-gray-400 whitespace-pre-wrap">{task.result}</p>
                            </div>
                        )}

                        {/* Комментарии */}
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-blue-400">Комментарии ({task.comments.length})</h3>
                            </div>

                            {/* Форма комментария */}
                            {showCommentForm && (
                                <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                                    <form onSubmit={handleCommentSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Тип комментария
                                            </label>
                                            <select
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="comment">Комментарий</option>
                                                <option value="status">Изменение статуса</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Содержание
                                            </label>
                                            <textarea
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                rows={3}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-blue-400 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                                placeholder="Введите комментарий..."
                                            />
                                            {errors.content && (
                                                <p className="mt-1 text-sm text-red-400">{errors.content}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowCommentForm(false)}
                                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                Отмена
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
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
                                        <div key={comment.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommentTypeColor(comment.type)}`}>
                                                        {getCommentTypeText(comment.type)}
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        {comment.user.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-400 mb-2">Комментарии отсутствуют</h3>
                                    <p className="text-gray-500">Добавьте первый комментарий к задаче</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-6">
                        {/* Проект */}
                        {task.project && (
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-green-400 mb-3">Проект</h3>
                                <Link
                                    href={route('projects.show', task.project.id)}
                                    className="text-green-400 hover:text-green-300 font-medium"
                                >
                                    {task.project.name}
                                </Link>
                            </div>
                        )}

                        {/* Ссылки */}
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-blue-400 mb-3">Ссылки</h3>
                            <div className="space-y-2">
                                {task.merge_request && (
                                    <a
                                        href={task.merge_request}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
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