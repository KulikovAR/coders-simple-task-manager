import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';
import HtmlRenderer from '@/Components/HtmlRenderer';
import { 
    getCommentTypeLabel, 
    getCommentTypeIcon, 
    getCommentTypeClass, 
    getCommentTemplate,
    getBasicCommentTypeOptions,
    getSpecialCommentTypeOptions,
    COMMENT_TYPES
} from '@/utils/commentUtils';

export default function TaskCommentsWithRichEditor({ 
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
        console.log('TaskComments: comments prop changed:', comments);
        setLocalComments(comments);
    }, [comments]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setProcessing(true);
        
        try {
            if (editingComment) {
                // Обновление комментария
                const response = await fetch(route('comments.update', editingComment.id), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify(data),
                });

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
                }
            } else {
                // Создание нового комментария
                const response = await fetch(route('tasks.comments.store', task.id), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Comment response:', result);
                    // Добавляем новый комментарий в начало списка
                    setLocalComments(prev => [result.comment, ...prev]);
                    reset();
                    setCommentType(COMMENT_TYPES.GENERAL);
                    setShowCommentForm(false);
                    if (onCommentAdded) {
                        console.log('Calling onCommentAdded with:', result.comment);
                        onCommentAdded(result.comment);
                    }
                }
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setProcessing(false);
        }
    };

    const startEditing = (comment) => {
        setEditingComment(comment);
        setData({
            content: comment.content,
            type: comment.type,
        });
        setCommentType(comment.type);
        setShowCommentForm(true);
    };

    const cancelEditing = () => {
        setEditingComment(null);
        reset();
        setCommentType(COMMENT_TYPES.GENERAL);
        setShowCommentForm(false);
    };

    const handleDeleteComment = async (comment) => {
        if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            return;
        }

        try {
            const response = await fetch(route('comments.destroy', comment.id), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            if (response.ok) {
                // Удаляем комментарий из локального состояния
                setLocalComments(prev => prev.filter(c => c.id !== comment.id));
                setDeletingComment(null);
                if (onCommentDeleted) {
                    onCommentDeleted(comment);
                }
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const canEditComment = (comment) => {
        return auth.user.id === comment.user_id;
    };

    const getCommentCardClass = (type) => {
        const baseClass = 'p-3 rounded-lg border';
        const typeClass = getCommentTypeClass(type);
        return `${baseClass} ${typeClass}`;
    };

    const handleMentionSelect = (user) => {
        console.log('User mentioned:', user);
        // Здесь можно добавить логику для уведомления упомянутого пользователя
    };

    return (
        <div className="space-y-4">
            {/* Кнопка добавления комментария */}
            {!showCommentForm && (
                <button
                    onClick={() => setShowCommentForm(true)}
                    className="btn btn-primary btn-sm"
                >
                    Добавить комментарий
                </button>
            )}

            {/* Форма комментария */}
            {showCommentForm && (
                <div className="p-4 bg-card-bg border border-border-color rounded-lg">
                    <h3 className="text-lg font-medium text-text-primary mb-4">
                        {editingComment ? 'Редактировать комментарий' : 'Новый комментарий'}
                    </h3>
                    
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        {/* Тип комментария */}
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">
                                Тип комментария
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {getBasicCommentTypeOptions().map((type) => (
                                    <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type.value}
                                            checked={data.type === type.value}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="text-accent-blue focus:ring-accent-blue"
                                        />
                                        <span className="text-sm text-text-primary">
                                            {type.label}
                                        </span>
                                    </label>
                                ))}
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
                                onMentionSelect={handleMentionSelect}
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
                    </form>
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
                                <HtmlRenderer content={comment.content} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-text-muted">
                        <p>Пока нет комментариев</p>
                    </div>
                )}
            </div>

            {/* Модальное окно подтверждения удаления */}
            {deletingComment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-text-primary mb-4">
                            Подтверждение удаления
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleDeleteComment(deletingComment)}
                                className="btn btn-danger btn-sm flex-1"
                            >
                                Удалить
                            </button>
                            <button
                                onClick={() => setDeletingComment(null)}
                                className="btn btn-secondary btn-sm flex-1"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
