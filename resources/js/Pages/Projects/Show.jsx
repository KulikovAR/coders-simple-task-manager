import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, project, tasks }) {
    const [showAddMember, setShowAddMember] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'member',
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-500 bg-opacity-20 text-green-400';
            case 'completed':
                return 'bg-blue-500 bg-opacity-20 text-blue-400';
            case 'on_hold':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
            case 'cancelled':
                return 'bg-red-500 bg-opacity-20 text-red-400';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
        }
    };

    const getStatusText = (status) => {
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
                return status;
        }
    };

    const getTaskStatusColor = (status) => {
        switch (status) {
            case 'To Do':
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
            case 'In Progress':
                return 'bg-blue-500 bg-opacity-20 text-blue-400';
            case 'Review':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
            case 'Testing':
                return 'bg-purple-500 bg-opacity-20 text-purple-400';
            case 'Ready for Release':
                return 'bg-pink-500 bg-opacity-20 text-pink-400';
            case 'Done':
                return 'bg-green-500 bg-opacity-20 text-green-400';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-400';
        }
    };

    const getTaskStatusText = (status) => {
        switch (status) {
            case 'To Do':
                return 'К выполнению';
            case 'In Progress':
                return 'В работе';
            case 'Review':
                return 'На проверке';
            case 'Testing':
                return 'Тестирование';
            case 'Ready for Release':
                return 'Готово к релизу';
            case 'Done':
                return 'Завершена';
            default:
                return status;
        }
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        post(route('projects.members.add', project.id), {
            onSuccess: () => {
                reset();
                setShowAddMember(false);
            },
        });
    };

    const handleRemoveMember = (userId) => {
        if (confirm('Вы уверены, что хотите удалить этого участника из проекта?')) {
            router.delete(route('projects.members.remove', project.id), {
                data: { user_id: userId },
            });
        }
    };

    // Удаление проекта
    const handleDelete = () => {
        router.delete(route('projects.destroy', project.id), {
            onSuccess: () => router.visit(route('projects.index')),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Проект</h2>}
        >
            <Head title={project.name} />

            <div className="space-y-6">
                {/* Заголовок и действия */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {getStatusText(project.status)}
                            </span>
                            <span>Создан: {new Date(project.created_at).toLocaleDateString('ru-RU')}</span>
                            {project.deadline && (
                                <span>Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('sprints.index', project.id)}
                            className="btn btn-primary"
                        >
                            Спринты
                        </Link>
                        <Link
                            href={route('projects.board', project.id)}
                            className="btn btn-secondary"
                        >
                            Доска
                        </Link>
                        <Link
                            href={route('projects.edit', project.id)}
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
                            href={route('tasks.create', { project_id: project.id })}
                            className="btn btn-secondary"
                        >
                            Добавить задачу
                        </Link>
                    </div>
                </div>

                {/* Описание */}
                {project.description && (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-3">Описание</h3>
                        <p className="text-gray-400 whitespace-pre-wrap">{project.description}</p>
                    </div>
                )}

                {/* Участники проекта */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Участники проекта ({1 + (project.members?.filter(member => member.user_id !== project.owner_id).length || 0)})</h3>
                        <button
                            onClick={() => setShowAddMember(!showAddMember)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {showAddMember ? 'Отмена' : 'Добавить участника'}
                        </button>
                    </div>

                    {/* Форма добавления участника */}
                    {showAddMember && (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Email пользователя
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Введите email пользователя..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Роль
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                                    >
                                        <option value="member">Участник</option>
                                        <option value="admin">Администратор</option>
                                    </select>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Добавление...' : 'Добавить'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddMember(false);
                                            reset();
                                        }}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Список участников */}
                    <div className="space-y-3">
                        {/* Владелец проекта */}
                        <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                                    {project.owner?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="ml-3">
                                    <p className="text-white font-medium">{project.owner?.name || 'Неизвестно'}</p>
                                    <p className="text-gray-400 text-sm">{project.owner?.email || 'email@example.com'}</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-xs font-medium">
                                Владелец
                            </span>
                        </div>

                        {/* Участники (исключая владельца) */}
                        {project.members?.filter(member => member.user_id !== project.owner_id).map((member) => (
                            <div key={member.id} className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                                        {member.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-white font-medium">{member.user?.name || 'Неизвестно'}</p>
                                        <p className="text-gray-400 text-sm">{member.user?.email || 'email@example.com'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-xs font-medium">
                                        {member.role === 'admin' ? 'Администратор' : 'Участник'}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveMember(member.user_id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                        title="Удалить участника"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {(!project.members || project.members.filter(member => member.user_id !== project.owner_id).length === 0) && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Нет дополнительных участников</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Документы */}
                {project.docs && project.docs.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-3">Документы</h3>
                        <div className="space-y-2">
                            {project.docs.map((doc, index) => (
                                <a
                                    key={index}
                                    href={doc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-white hover:text-gray-300 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Документ {index + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Задачи */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Задачи ({tasks.length})</h3>
                        <Link
                            href={route('tasks.create', { project_id: project.id })}
                            className="text-white hover:text-gray-300 text-sm font-medium"
                        >
                            + Добавить задачу
                        </Link>
                    </div>

                    {tasks.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium mb-2">
                                                <Link href={route('tasks.show', task.id)} className="hover:text-gray-300">
                                                    {task.title}
                                                </Link>
                                            </h4>
                                            {task.description && (
                                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status?.name || 'todo')}`}>
                                                    {getTaskStatusText(task.status?.name || 'todo')}
                                                </span>
                                                {task.priority && (
                                                    <span className="text-yellow-400">Приоритет: {task.priority}</span>
                                                )}
                                                {task.deadline && (
                                                    <span>Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <Link
                                                href={route('tasks.edit', task.id)}
                                                className="text-white hover:text-gray-300 text-sm"
                                            >
                                                Редактировать
                                            </Link>
                                            <Link
                                                href={route('tasks.show', task.id)}
                                                className="text-white hover:text-gray-300 text-sm"
                                            >
                                                Просмотр
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-400 mb-2">Задачи не найдены</h3>
                            <p className="text-gray-500 mb-4">Создайте первую задачу для этого проекта</p>
                            <Link
                                href={route('tasks.create', { project_id: project.id })}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Создать задачу
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Удалить проект?</h2>
                        <p className="mb-6">Вы уверены, что хотите удалить этот проект? Это действие необратимо. Все задачи и спринты будут удалены.</p>
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