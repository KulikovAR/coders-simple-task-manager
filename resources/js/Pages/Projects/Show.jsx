import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import TaskContentRenderer from '@/Components/TaskContentRenderer';
import LimitExceededModal from '@/Components/LimitExceededModal';

export default function Show({ auth, project, flash, canAddMember, subscriptionInfo }) {
    const [showAddMember, setShowAddMember] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [limitError, setLimitError] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'member',
    });
    
    // Проверяем наличие ошибки о превышении лимита в flash-сообщениях
    useEffect(() => {
        // Проверяем наличие данных о превышении лимита
        if (flash?.limitExceeded) {
            setLimitError({
                type: flash.limitExceeded.type,
                limit: flash.limitExceeded.limit,
                plan: flash.limitExceeded.plan
            });
            setShowLimitModal(true);
        }
    }, [flash]);

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

    const getStatusClass = (status) => {
        switch (status) {
            case 'active':
                return 'status-active';
            case 'completed':
                return 'status-completed';
            case 'on_hold':
                return 'status-on-hold';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-todo';
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

    // Закрытие выпадающего меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showActionsMenu && !event.target.closest('.relative')) {
                setShowActionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionsMenu]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Проект</h2>}
        >
            <Head title={project.name} />

            <div className="space-y-6">
                {/* Заголовок и панель действий */}
                <div className="space-y-4 lg:space-y-6">
                    {/* Основная информация о проекте */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-6">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-heading-2 text-text-primary mb-3 break-words">{project.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-body-small text-text-secondary">
                                <span className={`status-badge ${getStatusClass(project.status)} flex-shrink-0`}>
                                    {getStatusText(project.status)}
                                </span>
                                <span className="flex-shrink-0">Создан: {new Date(project.created_at).toLocaleDateString('ru-RU')}</span>
                                {project.deadline && (
                                    <span className="text-accent-yellow flex-shrink-0">
                                        Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Компактная панель действий */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
                            {/* Основные действия */}
                            <div className="flex gap-2">
                                <Link
                                    href={route('projects.board', project.id)}
                                    className="btn btn-primary inline-flex items-center text-center flex-1 sm:flex-none"
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                    </svg>
                                    <span className="hidden sm:inline">Доска</span>
                                    <span className="sm:hidden">Доска</span>
                                </Link>
                                <Link
                                    href={route('sprints.index', project.id)}
                                    className="btn btn-secondary inline-flex items-center text-center flex-1 sm:flex-none"
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="hidden sm:inline">Спринты</span>
                                    <span className="sm:hidden">Спринты</span>
                                </Link>
                                <Link
                                    href={route('webhooks.index', project.id)}
                                    className="btn btn-info inline-flex items-center text-center flex-1 sm:flex-none"
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span className="hidden sm:inline">Webhook'и</span>
                                    <span className="sm:hidden">Webhook'и</span>
                                </Link>
                            </div>

                            {/* Действия создания */}
                            <div className="flex gap-2">
                                <Link
                                    href={route('tasks.create', { project_id: project.id })}
                                    className="btn btn-success inline-flex items-center text-center flex-1 sm:flex-none"
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="hidden sm:inline">Новая задача</span>
                                    <span className="sm:hidden">Задача</span>
                                </Link>

                                {/* Выпадающее меню дополнительных действий */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                                        className="btn btn-secondary inline-flex items-center text-center"
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    {showActionsMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-card-bg border border-border-color rounded-xl shadow-lg z-50">
                                            <div className="py-2">
                                                <Link
                                                    href={route('projects.edit', project.id)}
                                                    className="flex items-center px-4 py-2 text-body-small text-text-primary hover:bg-secondary-bg transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span className="hidden sm:inline">Редактировать</span>
                                                    <span className="sm:hidden">Изменить</span>
                                                </Link>
                                                <Link
                                                    href={route('projects.statuses', project.id)}
                                                    className="flex items-center px-4 py-2 text-body-small text-text-primary hover:bg-secondary-bg transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                    </svg>
                                                    <span className="hidden sm:inline">Статусы задач</span>
                                                    <span className="sm:hidden">Статусы</span>
                                                </Link>
                                                <hr className="my-2 border-border-color" />
                                                <button
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="flex items-center w-full px-4 py-2 text-body-small text-accent-red hover:bg-secondary-bg transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span className="hidden sm:inline">Удалить проект</span>
                                                    <span className="sm:hidden">Удалить</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Описание */}
                {project.description && (
                    <div className="card">
                        <h3 className="card-title mb-3">Описание</h3>
                        <div className="prose prose-sm max-w-none">
                            <TaskContentRenderer content={project.description} />
                        </div>
                    </div>
                )}

                {/* Участники проекта */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Участники проекта ({1 + (project.members?.filter(member => member.user_id !== project.owner_id).length || 0)})</h3>
                        {canAddMember ? (
                            <button
                                onClick={() => setShowAddMember(!showAddMember)}
                                className="btn btn-secondary btn-sm"
                            >
                                {showAddMember ? 'Отмена' : 'Добавить участника'}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setLimitError({
                                        type: 'members',
                                        limit: subscriptionInfo.members_limit,
                                        plan: subscriptionInfo.name
                                    });
                                    setShowLimitModal(true);
                                }}
                                className="btn btn-secondary btn-sm"
                            >
                                Обновить тариф
                            </button>
                        )}
                    </div>

                    {/* Форма добавления участника */}
                    {showAddMember && (
                        <div className="bg-secondary-bg border border-border-color rounded-lg p-4 mb-4">
                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="form-label">
                                        Email пользователя
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Введите email пользователя..."
                                        className="form-input"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-body-small text-accent-red">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">
                                        Роль
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="member">Участник</option>
                                        <option value="admin">Администратор</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn btn-primary disabled:opacity-50"
                                    >
                                        {processing ? 'Добавление...' : 'Добавить'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddMember(false);
                                            reset();
                                        }}
                                        className="btn btn-secondary"
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-secondary-bg border border-border-color rounded-lg p-3 sm:p-4 gap-3 sm:gap-0">
                            <div className="flex items-center min-w-0 flex-1">
                                <div className="w-8 h-8 bg-card-bg rounded-full flex items-center justify-center text-text-primary font-medium border border-border-color flex-shrink-0 overflow-hidden">
                                    {project.owner?.avatar ? (
                                        <img src={`/storage/${project.owner.avatar}`} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <span>{project.owner?.name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                                <div className="ml-3 min-w-0 flex-1">
                                    <p className="text-text-primary font-medium break-words">{project.owner?.name || 'Неизвестно'}</p>
                                    <p className="text-text-secondary text-body-small break-all sm:break-normal">{project.owner?.email || 'email@example.com'}</p>
                                </div>
                            </div>
                            <span className="status-badge status-active flex-shrink-0 text-center">
                                Владелец
                            </span>
                        </div>

                        {/* Участники (исключая владельца) */}
                        {project.members?.filter(member => member.user_id !== project.owner_id).map((member) => (
                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-secondary-bg border border-border-color rounded-lg p-3 sm:p-4 gap-3 sm:gap-0">
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="w-8 h-8 bg-card-bg rounded-full flex items-center justify-center text-text-primary font-medium border border-border-color flex-shrink-0 overflow-hidden">
                                        {member.user?.avatar ? (
                                            <img src={`/storage/${member.user.avatar}`} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <span>{member.user?.name?.charAt(0) || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="ml-3 min-w-0 flex-1">
                                        <p className="text-text-primary font-medium break-words">{member.user?.name || 'Неизвестно'}</p>
                                        <p className="text-text-secondary text-body-small break-all sm:break-normal">{member.user?.email || 'email@example.com'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="status-badge status-in-progress text-center">
                                        {member.role === 'admin' ? 'Администратор' : 'Участник'}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveMember(member.user_id)}
                                        className="text-accent-red hover:text-red-300 transition-colors p-1 flex-shrink-0"
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
                            <div className="text-center py-6 sm:py-8">
                                <p className="text-text-muted">Нет дополнительных участников</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Документы */}
                {project.docs && project.docs.length > 0 && (
                    <div className="card">
                        <h3 className="card-title mb-3">Документы</h3>
                        <div className="space-y-2">
                            {project.docs.map((doc, index) => (
                                <a
                                    key={index}
                                    href={doc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-text-primary hover:text-accent-blue transition-colors"
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
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Задачи</h3>
                    </div>

                    <div className="text-center py-6 sm:py-8">
                        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📋</div>
                        <h3 className="text-lg sm:text-heading-4 text-text-secondary mb-2">Управление задачами</h3>
                        <p className="text-sm sm:text-base text-text-muted mb-3 sm:mb-4 px-4">
                            Просматривайте и управляйте задачами проекта
                        </p>

                        <div className="flex justify-center">
                            <Link
                                href={route('tasks.index', { project_id: project.id })}
                                className="btn btn-primary text-center"
                            >
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <span className="hidden sm:inline">Просмотреть все задачи</span>
                                <span className="sm:hidden">Все задачи</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно превышения лимита */}
            {showLimitModal && limitError && (
                <LimitExceededModal
                    isOpen={showLimitModal}
                    onClose={() => setShowLimitModal(false)}
                    limitType={limitError.type}
                    currentLimit={limitError.limit}
                    currentPlan={limitError.plan}
                />
            )}
            
            {/* Модальное окно подтверждения удаления */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-card-bg rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl border border-border-color">
                        <h2 className="text-lg sm:text-heading-4 text-text-primary mb-3 sm:mb-4">Удалить проект?</h2>
                        <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">Вы уверены, что хотите удалить этот проект? Это действие необратимо. Все задачи и спринты будут удалены.</p>
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
