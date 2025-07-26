import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { getStatusClass, getStatusLabel, getPriorityColor, getPriorityLabel, getPriorityIcon } from '@/utils/statusUtils';
import { 
    getCommentTypeLabel, 
    getCommentTypeIcon, 
    getCommentTypeClass, 
    getCommentTemplate,
    getBasicCommentTypeOptions,
    getSpecialCommentTypeOptions,
    COMMENT_TYPES
} from '@/utils/commentUtils';

export default function Show({ auth, task }) {
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentType, setCommentType] = useState(COMMENT_TYPES.GENERAL);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        content: '',
        type: COMMENT_TYPES.GENERAL,
    });

    const getPriorityText = (priority) => {
        return getPriorityLabel(priority);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.comments.store', task.id), {
            onSuccess: () => {
                setData('content', '');
                setData('type', COMMENT_TYPES.GENERAL);
                setCommentType(COMMENT_TYPES.GENERAL);
                setShowCommentForm(false);
            },
        });
    };

    const handleCommentTypeChange = (newType) => {
        setCommentType(newType);
        setData('type', newType);
        
        const template = getCommentTemplate(newType);
        if (template) {
            setData('content', template);
        } else {
            setData('content', '');
        }
    };

    const getCommentCardClass = (commentType) => {
        const baseClass = 'comment-card';
        const specialClass = commentType !== COMMENT_TYPES.GENERAL ? 'comment-card-special' : '';
        const typeClass = `comment-card-${commentType.replace('_', '-')}`;
        
        return `${baseClass} ${specialClass} ${typeClass}`;
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
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                            <span className={`status-badge ${getStatusClass(task.status?.name)}`}>
                                {getStatusLabel(task.status?.name)}
                            </span>
                            {task.priority && (
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                    <span>{getPriorityIcon(task.priority)}</span>
                                    <span>Приоритет: {getPriorityText(task.priority)}</span>
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
                                        {/* Тип комментария */}
                                        <div>
                                            <label className="form-label">Тип комментария</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {/* Основные типы */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-text-secondary mb-2">Основные</h4>
                                                    <div className="space-y-2">
                                                        {getBasicCommentTypeOptions().map((option) => (
                                                            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="commentType"
                                                                    value={option.value}
                                                                    checked={commentType === option.value}
                                                                    onChange={(e) => handleCommentTypeChange(e.target.value)}
                                                                    className="form-radio"
                                                                />
                                                                <span className="text-sm">{option.icon} {option.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Специальные типы */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-text-secondary mb-2">Специальные</h4>
                                                    <div className="space-y-2">
                                                        {getSpecialCommentTypeOptions().map((option) => (
                                                            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="commentType"
                                                                    value={option.value}
                                                                    checked={commentType === option.value}
                                                                    onChange={(e) => handleCommentTypeChange(e.target.value)}
                                                                    className="form-radio"
                                                                />
                                                                <span className="text-sm">{option.icon} {option.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {errors.type && (
                                                <p className="mt-1 text-sm text-accent-red">{errors.type}</p>
                                            )}
                                        </div>

                                        {/* Содержание комментария */}
                                        <div>
                                            <label htmlFor="content" className="form-label">
                                                Содержание
                                            </label>
                                            <textarea
                                                id="content"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                rows={commentType === COMMENT_TYPES.GENERAL ? 4 : 8}
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

                                        {/* Кнопки */}
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

                            {/* Список комментариев */}
                            <div className="space-y-4">
                                {task.comments && task.comments.length > 0 ? (
                                    task.comments.map((comment) => (
                                        <div key={comment.id} className={getCommentCardClass(comment.type)}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`comment-badge ${getCommentTypeClass(comment.type)}`}>
                                                        {getCommentTypeIcon(comment.type)} {getCommentTypeLabel(comment.type)}
                                                    </span>
                                                    <span className="text-sm font-medium text-text-primary">
                                                        {comment.user.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-text-muted">
                                                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                                                </span>
                                            </div>
                                            <div className="text-text-secondary text-sm whitespace-pre-wrap">
                                                {comment.content}
                                            </div>
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
                                        <Link
                                            href={route('sprints.show', [task.project.id, task.sprint.id])}
                                            className="text-sm text-accent-blue hover:text-accent-green transition-colors"
                                        >
                                            {task.sprint.name}
                                        </Link>
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

            {/* Модальное окно подтверждения удаления */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg">
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