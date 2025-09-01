import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';
import TaskContentRenderer from '@/Components/TaskContentRenderer';
import {
    getCommentTypeLabel,
    getCommentTypeIcon,
    getCommentTypeClass,
    getCommentTemplate,
    getBasicCommentTypeOptions,
    getSpecialCommentTypeOptions,
    COMMENT_TYPES
} from '@/utils/commentUtils';

export default function TaskComments({
    task,
    comments = [],
    auth,
    users = [], // Список пользователей проекта для упоминаний
    onCommentAdded = null,
    onCommentUpdated = null,
    onCommentDeleted = null,
    compact = false
}) {
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentType, setCommentType] = useState(COMMENT_TYPES.GENERAL);
    const [editingComment, setEditingComment] = useState(null);
    const [deletingComment, setDeletingComment] = useState(null);
    const [localComments, setLocalComments] = useState(comments);
    const [processing, setProcessing] = useState(false);

    const { data, setData, errors, reset } = useForm({
        content: '',
        type: COMMENT_TYPES.GENERAL,
    });

    // Синхронизируем локальные комментарии с пропсами
    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);



    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setProcessing(true);

        try {
            // Получаем актуальный CSRF токен
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                console.error('CSRF токен не найден');
                setProcessing(false);
                return;
            }

            if (editingComment) {
                // Обновление комментария
                const response = await fetch(route('comments.update', editingComment.id), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify(data),
                    credentials: 'same-origin', // Важно для передачи cookies
                });

                if (response.status === 419) {
                    window.location.reload();
                    return;
                }

                if (response.ok) {
                    const result = await response.json();
                    // Обновляем комментарий в локальном состоянии
                    setLocalComments(prev => prev.map(comment =>
                        comment.id === editingComment.id ? result.comment : comment
                    ));
                    reset();
                    setCommentType(COMMENT_TYPES.GENERAL);
                    setShowCommentForm(false);
                    setEditingComment(null);
                    if (onCommentUpdated) {
                        onCommentUpdated(result.comment);
                    }
                } else {
                    const errorData = await response.json();
                    console.error('Ошибка обновления комментария:', errorData);
                }
            } else {
                // Создание нового комментария
                const response = await fetch(route('tasks.comments.store', task.id), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify(data),
                    credentials: 'same-origin', // Важно для передачи cookies
                });

                if (response.status === 419) {
                    window.location.reload();
                    return;
                }

                if (response.ok) {
                    const result = await response.json();
                        // Добавляем новый комментарий в начало списка
                    setLocalComments(prev => [result.comment, ...prev]);
                    reset();
                    setCommentType(COMMENT_TYPES.GENERAL);
                    setShowCommentForm(false);
                    if (onCommentAdded) {
                        onCommentAdded(result.comment);
                    }
                } else {
                    const errorData = await response.json();
                    console.error('Ошибка создания комментария:', errorData);

                    // Если ошибка связана с CSRF, показываем сообщение пользователю
                    if (errorData.message && errorData.message.includes('CSRF')) {
                        alert('Сессия истекла. Пожалуйста, обновите страницу и попробуйте снова.');
                        window.location.reload();
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при отправке комментария:', error);

            // Если ошибка сети, показываем сообщение пользователю
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('Ошибка сети. Проверьте подключение к интернету и попробуйте снова.');
            }
        }

        setProcessing(false);
    };

    const handleCommentTypeChange = (newType) => {
        setCommentType(newType);
        setData('type', newType);

        const template = getCommentTemplate(newType);
        if (template && !editingComment) {
            setData('content', template);
        }
    };

    const startEditing = (comment) => {
        setEditingComment(comment);
        setCommentType(comment.type);
        setData({
            content: comment.content,
            type: comment.type,
        });
        setShowCommentForm(true);
    };

    const cancelEditing = () => {
        setEditingComment(null);
        setShowCommentForm(false);
        reset();
        setCommentType(COMMENT_TYPES.GENERAL);
    };

    const handleDelete = async (comment) => {
        try {
            // Получаем актуальный CSRF токен
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                console.error('CSRF токен не найден');
                return;
            }

            const response = await fetch(route('comments.destroy', comment.id), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin', // Важно для передачи cookies
            });

            if (response.status === 419) {
                window.location.reload();
                return;
            }

            if (response.ok) {
                // Удаляем комментарий из локального состояния
                setLocalComments(prev => prev.filter(c => c.id !== comment.id));
                setDeletingComment(null);
                if (onCommentDeleted) {
                    onCommentDeleted(comment.id);
                }
            } else {
                const errorData = await response.json();
                console.error('Ошибка удаления комментария:', errorData);

                // Если ошибка связана с CSRF, показываем сообщение пользователю
                if (errorData.message && errorData.message.includes('CSRF')) {
                    alert('Сессия истекла. Пожалуйста, обновите страницу и попробуйте снова.');
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);

            // Если ошибка сети, показываем сообщение пользователю
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('Ошибка сети. Проверьте подключение к интернету и попробуйте снова.');
            }
        }
    };

    const getCommentCardClass = (commentType) => {
        const baseClass = compact
            ? 'bg-secondary-bg border border-border-color rounded-lg p-3'
            : 'comment-card';
        const specialClass = commentType !== COMMENT_TYPES.GENERAL ? 'comment-card-special' : '';
        const typeClass = `comment-card-${commentType.replace('_', '-')}`;

        return `${baseClass} ${specialClass} ${typeClass}`;
    };

    const canEditComment = (comment) => {
        return comment.user_id === auth.user.id;
    };

    return (
        <div className={compact ? "space-y-3" : "card"}>
            {!compact && (
                <div className="card-header">
                    <h3 className="card-title">Комментарии</h3>
                    <button
                        onClick={() => setShowCommentForm(!showCommentForm)}
                        className="btn btn-primary btn-sm"
                    >
                        {showCommentForm ? 'Отмена' : 'Добавить комментарий'}
                    </button>
                </div>
            )}

            {compact && !showCommentForm && (
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-text-primary">Комментарии ({localComments.length})</h4>
                    <button
                        onClick={() => setShowCommentForm(true)}
                        className="text-xs bg-accent-blue text-white px-2 py-1 rounded hover:bg-accent-blue/80 transition-colors"
                    >
                        + Добавить
                    </button>
                </div>
            )}

            {showCommentForm && (
                <div className="mb-4 space-y-3">
                    {/* Тип комментария */}
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-2">
                            Тип комментария
                        </label>
                        <div className={compact ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 gap-3"}>
                            {/* Основные типы */}
                            <div>
                                {!compact && (
                                    <h4 className="text-sm font-medium text-text-secondary mb-2">Основные</h4>
                                )}
                                <div className="space-y-2">
                                    {getBasicCommentTypeOptions().map((option) => (
                                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="commentType"
                                                value={option.value}
                                                checked={commentType === option.value}
                                                onChange={(e) => handleCommentTypeChange(e.target.value)}
                                                className="form-radio text-accent-blue"
                                            />
                                            <span className="text-xs">{option.icon} {option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Специальные типы - показываем всегда */}
                            <div>
                                {!compact && (
                                    <h4 className="text-sm font-medium text-text-secondary mb-2">Специальные</h4>
                                )}
                                <div className="space-y-2">
                                    {getSpecialCommentTypeOptions().map((option) => (
                                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="commentType"
                                                value={option.value}
                                                checked={commentType === option.value}
                                                onChange={(e) => handleCommentTypeChange(e.target.value)}
                                                className="form-radio text-accent-blue"
                                            />
                                            <span className="text-xs">{option.icon} {option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {errors.type && (
                            <p className="mt-1 text-xs text-accent-red">{errors.type}</p>
                        )}
                    </div>

                    {/* Содержание комментария */}
                    <div>
                        <label htmlFor="content" className="block text-xs font-medium text-text-secondary mb-2">
                            Содержание
                        </label>
                        <RichTextEditor
                            value={data.content}
                            onChange={(newValue) => setData('content', newValue)}
                            onMentionSelect={(user) => {

                            }}
                            users={users}
                            placeholder="Введите комментарий... (используйте @ для упоминания пользователей, поддерживается форматирование, изображения и ссылки)"
                            className={`w-full ${
                                errors.content ? 'border-accent-red' : ''
                            }`}
                        />
                        {errors.content && (
                            <p className="mt-1 text-xs text-accent-red">{errors.content}</p>
                        )}
                    </div>

                    {/* Кнопки */}
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleCommentSubmit}
                            className="btn btn-primary btn-sm"
                        >
                            {processing ? 'Отправка...' : (editingComment ? 'Обновить' : 'Отправить')}
                        </button>
                        <button
                            type="button"
                            onClick={editingComment ? cancelEditing : () => setShowCommentForm(false)}
                            className="btn btn-secondary btn-sm"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Список комментариев */}
            <div className="space-y-3">
                {localComments && localComments.length > 0 ? (
                    localComments
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((comment) => (
                        <div key={comment.id} className={getCommentCardClass(comment.type)}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    {comment.user.avatar ? (
                                        <img src={`/storage/${comment.user.avatar}`} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-border-color" />
                                    ) : (
                                        <span className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-bold flex items-center justify-center border border-border-color">
                                            {comment.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                    <span className={`comment-badge ${getCommentTypeClass(comment.type)} text-xs px-2 py-1 rounded`}>
                                        {getCommentTypeIcon(comment.type)} {getCommentTypeLabel(comment.type)}
                                    </span>
                                    <span className="text-xs font-medium text-text-primary">
                                        {comment.user.name}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-text-muted">
                                        {new Date(comment.created_at).toLocaleString('ru-RU')}
                                    </span>
                                    {canEditComment(comment) && (
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => startEditing(comment)}
                                                className="text-xs text-accent-blue hover:text-accent-blue/80"
                                                title="Редактировать"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => setDeletingComment(comment)}
                                                className="text-xs text-accent-red hover:text-accent-red/80"
                                                title="Удалить"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-text-secondary text-sm">
                                <TaskContentRenderer content={comment.content} />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-text-muted text-center py-3 text-xs">
                        Комментариев пока нет
                    </p>
                )}
            </div>

            {/* Модальное окно подтверждения удаления */}
            {deletingComment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card-bg border border-border-color rounded-xl p-4 w-full max-w-sm shadow-2xl">
                        <h3 className="text-base font-bold mb-3">Удалить комментарий?</h3>
                        <p className="mb-4 text-sm text-text-secondary">Вы уверены, что хотите удалить этот комментарий? Это действие необратимо.</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setDeletingComment(null)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(deletingComment)}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
