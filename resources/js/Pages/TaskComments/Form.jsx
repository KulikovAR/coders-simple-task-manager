import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import RichTextEditor from '@/Components/RichTextEditor';
import {
    getBasicCommentTypeOptions,
    getSpecialCommentTypeOptions,
    COMMENT_TYPES
} from '@/utils/commentUtils';

export default function Form({ auth, comment, task }) {
    const isEditing = !!comment;
    const [commentType, setCommentType] = useState(
        isEditing ? comment.type : COMMENT_TYPES.GENERAL
    );

    const { data, setData, put, post, processing, errors } = useForm({
        content: isEditing ? comment.content : '',
        type: isEditing ? comment.type : COMMENT_TYPES.GENERAL,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('comments.update', comment.id), {
                preserveScroll: true,
            });
        } else {
            post(route('tasks.comments.store', task.id), {
                preserveScroll: true,
            });
        }
    };

    const availableTypes = [
        ...getBasicCommentTypeOptions(),
        ...getSpecialCommentTypeOptions()
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-text-primary leading-tight">
                        {isEditing ? 'Редактировать комментарий' : 'Добавить комментарий'}
                    </h2>
                    <Link
                        href={route('tasks.show', task.id)}
                        className="btn btn-secondary"
                    >
                        Отмена
                    </Link>
                </div>
            }
        >
            <Head title={isEditing ? 'Редактировать комментарий' : 'Добавить комментарий'} />

            <div className="space-y-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-text-primary">
                            {isEditing ? 'Редактирование комментария' : 'Новый комментарий'}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                            Задача: {task.title}
                        </p>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Тип комментария */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Тип комментария
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => {
                                        setData('type', e.target.value);
                                        setCommentType(e.target.value);
                                    }}
                                    className="input-field"
                                >
                                    {availableTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                                )}
                            </div>

                            {/* Содержание комментария */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Комментарий
                                </label>
                                {(() => {
                                    // Собираем всех пользователей проекта
                                    const projectUsers = task.project 
                                        ? [
                                            ...(task.project.owner ? [task.project.owner] : []), 
                                            ...(task.project.users || [])
                                          ]
                                          // Убираем дубликаты по ID
                                          .filter((user, index, array) => 
                                            array.findIndex(u => u.id === user.id) === index
                                          )
                                          // Проверяем наличие необходимых полей
                                          .filter(user => user && user.id && user.name && user.email);
                                    
                                    console.log('TaskComments/Form - task.project:', task.project);
                                    console.log('TaskComments/Form - task.project.owner:', task.project?.owner);
                                    console.log('TaskComments/Form - task.project.users:', task.project?.users);
                                    console.log('TaskComments/Form - итоговые пользователи:', projectUsers);
                                    
                                    return (
                                        <RichTextEditor
                                            value={data.content}
                                            onChange={(value) => setData('content', value)}
                                            onMentionSelect={(user) => {
                                                if (user && user.email) {
                                                    // Обновляем содержимое с упоминанием
                                                    const mention = `@${user.email}`;
                                                    console.log('TaskComments/Form - Добавляем упоминание:', mention);
                                                }
                                            }}
                                            users={projectUsers}
                                            placeholder="Введите комментарий... (используйте @ для упоминания пользователей, поддерживается форматирование, изображения и ссылки)"
                                            className="w-full"
                                        />
                                    );
                                })()}
                                {errors.content && (
                                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                                )}
                            </div>

                            {/* Кнопки */}
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-primary"
                                >
                                    {processing ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Добавить комментарий')}
                                </button>
                                
                                <Link
                                    href={route('tasks.show', task.id)}
                                    className="btn btn-secondary"
                                >
                                    Отмена
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
