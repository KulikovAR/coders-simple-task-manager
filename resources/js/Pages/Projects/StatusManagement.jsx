import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
export default function StatusManagement({ 
    auth, 
    project, 
    sprint = null, 
    taskStatuses = [], 
    hasCustomStatuses = false,
    projectStatuses = [],
    type = 'project',
    flash = {},
    errors: pageErrors = {}
}) {
    const [statuses, setStatuses] = useState(taskStatuses || []);
    const [isEditing, setIsEditing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errors, setErrors] = useState(pageErrors || {});
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Цвета по умолчанию для новых статусов
    const defaultColors = [
        '#6B7280', // gray
        '#3B82F6', // blue
        '#F59E0B', // yellow
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#10B981', // green
        '#EF4444', // red
        '#F97316', // orange
    ];

    useEffect(() => {
        setStatuses(taskStatuses || []);
    }, [taskStatuses]);

    useEffect(() => {
        setErrors(pageErrors || {});
    }, [pageErrors]);

    const isSprintMode = type === 'sprint';
    const pageTitle = isSprintMode ? `Статусы спринта: ${sprint?.name}` : `Статусы проекта: ${project.name}`;

    const handleAddStatus = () => {
        const newStatus = {
            id: null,
            name: '',
            color: defaultColors[statuses.length % defaultColors.length],
            order: statuses.length + 1,
            isNew: true
        };
        setStatuses([...statuses, newStatus]);
        setIsEditing(true);
    };

    const handleStatusChange = (index, field, value) => {
        const updatedStatuses = [...statuses];
        updatedStatuses[index] = { ...updatedStatuses[index], [field]: value };
        setStatuses(updatedStatuses);
    };

    const handleRemoveStatus = (index) => {
        const updatedStatuses = statuses.filter((_, i) => i !== index);
        setStatuses(updatedStatuses);
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const updatedStatuses = [...statuses];
        const draggedItem = updatedStatuses[draggedIndex];
        
        // Удаляем элемент из старой позиции
        updatedStatuses.splice(draggedIndex, 1);
        
        // Вставляем в новую позицию
        updatedStatuses.splice(index, 0, draggedItem);
        
        setStatuses(updatedStatuses);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = () => {
        setProcessing(true);
        setErrors({});

        // Валидация
        const hasErrors = statuses.some(status => !status.name.trim());
        if (hasErrors) {
            setErrors({ statuses: 'Все статусы должны иметь название' });
            setProcessing(false);
            return;
        }

        const data = {
            statuses: statuses.map(status => ({
                id: status.isNew ? null : status.id,
                name: status.name.trim(),
                color: status.color
            }))
        };

        const url = isSprintMode 
            ? route('sprints.statuses.update', [project.id, sprint.id])
            : route('projects.statuses.update', project.id);

        router.put(url, data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                setProcessing(false);
                setErrors({}); // Очищаем ошибки при успехе
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    const handleCancel = () => {
        setStatuses(taskStatuses || []);
        setIsEditing(false);
        setErrors({});
    };

    const handleCreateCustomStatuses = () => {
        setProcessing(true);
        
        router.post(route('sprints.statuses.create', [project.id, sprint.id]), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                setErrors({}); // Очищаем ошибки при успехе
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    const handleDeleteCustomStatuses = () => {
        setProcessing(true);
        
        router.delete(route('sprints.statuses.delete', [project.id, sprint.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setProcessing(false);
                setErrors({}); // Очищаем ошибки при успехе
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
                setShowDeleteModal(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">{pageTitle}</h2>}
        >
            <Head title={pageTitle} />

            <div className="space-y-6">
                {/* Отображение ошибок в самом верху */}
                {Object.keys(errors).length > 0 && (
                    <div className="space-y-2">
                        {errors.message && (
                            <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h4 className="font-medium mb-1">Ошибка при сохранении статусов</h4>
                                            <p className="text-sm">{errors.message}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setErrors({})}
                                        className="text-accent-red/70 hover:text-accent-red transition-colors"
                                        title="Закрыть"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Показываем остальные ошибки */}
                        {Object.entries(errors)
                            .filter(([key]) => key !== 'message')
                            .map(([key, message]) => (
                                <div key={key} className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="text-sm">{typeof message === 'string' ? message : JSON.stringify(message)}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors[key];
                                                return newErrors;
                                            })}
                                            className="text-accent-red/70 hover:text-accent-red transition-colors"
                                            title="Закрыть"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* Хлебные крошки */}
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Link href={route('projects.index')} className="hover:text-accent-blue">Проекты</Link>
                    <span>/</span>
                    <Link href={route('projects.show', project.id)} className="hover:text-accent-blue">{project.name}</Link>
                    {isSprintMode && (
                        <>
                            <span>/</span>
                            <Link href={route('sprints.show', [project.id, sprint.id])} className="hover:text-accent-blue">{sprint.name}</Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-text-primary">Статусы</span>
                </div>

                {/* Заголовок с описанием */}
                <div className="card">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-heading-2 text-text-primary mb-2">{pageTitle}</h1>
                            <p className="text-body-small text-text-secondary">
                                {isSprintMode 
                                    ? 'Настройте статусы для этого спринта. Если не создавать кастомные статусы, будут использоваться статусы проекта.'
                                    : 'Настройте статусы задач для проекта. Эти статусы будут использоваться по умолчанию во всех спринтах.'
                                }
                            </p>
                        </div>
                        
                        {isSprintMode && !hasCustomStatuses && (
                            <PrimaryButton
                                onClick={handleCreateCustomStatuses}
                                disabled={processing}
                            >
                                Создать кастомные статусы
                            </PrimaryButton>
                        )}
                    </div>
                </div>

                {/* Отображение статусов проекта для спринта без кастомных статусов */}
                {isSprintMode && !hasCustomStatuses && (
                    <div className="card">
                        <h3 className="text-heading-3 text-text-primary mb-4">
                            Используются статусы проекта
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(projectStatuses || []).map((status) => (
                                <div key={status.id} className="bg-secondary-bg border border-border-color rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-5 h-5 rounded-full border border-border-color shadow-sm"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        <span className="text-text-primary font-medium">{status.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Управление статусами */}
                {(!isSprintMode || hasCustomStatuses) && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-heading-3 text-text-primary">
                                {isEditing ? 'Редактирование статусов' : 'Список статусов'}
                            </h3>
                            
                            <div className="flex items-center gap-3">
                                {isSprintMode && hasCustomStatuses && !isEditing && (
                                    <DangerButton
                                        onClick={() => setShowDeleteModal(true)}
                                        disabled={processing}
                                    >
                                        Удалить кастомные статусы
                                    </DangerButton>
                                )}
                                
                                {!isEditing ? (
                                    <PrimaryButton
                                        onClick={() => setIsEditing(true)}
                                        disabled={processing}
                                    >
                                        Редактировать
                                    </PrimaryButton>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <SecondaryButton
                                            onClick={handleCancel}
                                            disabled={processing}
                                        >
                                            Отмена
                                        </SecondaryButton>
                                        <PrimaryButton
                                            onClick={handleSave}
                                            disabled={processing}
                                        >
                                            Сохранить
                                        </PrimaryButton>
                                    </div>
                                )}
                            </div>
                        </div>

                                {/* Показываем все ошибки */}
        {Object.keys(errors).length > 0 && (
            <div className="mb-4 space-y-2">
                {errors.statuses && (
                    <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
                        {errors.statuses}
                    </div>
                )}
                {errors.message && (
                    <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
                        {errors.message}
                    </div>
                )}
                {/* Для всех остальных ошибок */}
                {Object.entries(errors)
                    .filter(([key]) => !['statuses', 'message'].includes(key))
                    .map(([key, message]) => (
                        <div key={key} className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
                            {typeof message === 'string' ? message : JSON.stringify(message)}
                        </div>
                    ))
                }
            </div>
        )}

                        <div className="space-y-3">
                            {statuses.map((status, index) => (
                                <div
                                    key={status.id || index}
                                    className={`bg-secondary-bg border border-border-color rounded-lg p-4 transition-all duration-200 ${
                                        isEditing ? 'cursor-move hover:shadow-md' : ''
                                    } ${draggedIndex === index ? 'opacity-50' : ''}`}
                                    draggable={isEditing}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="flex items-center gap-4">
                                        {isEditing && (
                                            <div className="text-text-muted cursor-move">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM8 4h4v2H8V4zm0 4h4v2H8V8zm0 4h4v2H8v-2z"/>
                                                </svg>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 flex-1">
                                            {isEditing ? (
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={status.color}
                                                        onChange={(e) => handleStatusChange(index, 'color', e.target.value)}
                                                        className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                                                    />
                                                    <div 
                                                        className="w-8 h-8 rounded-full border-2 border-border-color cursor-pointer hover:scale-110 transition-transform duration-200 shadow-sm"
                                                        style={{ backgroundColor: status.color }}
                                                    />
                                                </div>
                                            ) : (
                                                <div 
                                                    className="w-6 h-6 rounded-full border border-border-color shadow-sm"
                                                    style={{ backgroundColor: status.color }}
                                                />
                                            )}
                                            
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={status.name}
                                                    onChange={(e) => handleStatusChange(index, 'name', e.target.value)}
                                                    placeholder="Название статуса"
                                                    className="form-input flex-1"
                                                />
                                            ) : (
                                                <span className="text-text-primary font-medium">{status.name}</span>
                                            )}
                                        </div>

                                        {isEditing && (
                                            <button
                                                onClick={() => handleRemoveStatus(index)}
                                                className="text-accent-red hover:text-accent-red/80 p-1"
                                                disabled={statuses.length <= 1}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isEditing && (
                            <div className="mt-4">
                                <SecondaryButton
                                    onClick={handleAddStatus}
                                    className="w-full border-dashed"
                                >
                                    + Добавить статус
                                </SecondaryButton>
                            </div>
                        )}

                        {!isEditing && statuses.length === 0 && (
                            <div className="text-center py-8 text-text-muted">
                                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p>Нет настроенных статусов</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Модальное окно подтверждения удаления */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h3 className="text-heading-3 text-text-primary mb-4">
                        Удалить кастомные статусы?
                    </h3>
                    <p className="text-body-small text-text-secondary mb-6">
                        Это действие удалит все кастомные статусы спринта. 
                        Спринт будет использовать статусы проекта.
                        <br /><br />
                        <strong>Внимание:</strong> Убедитесь, что нет задач с кастомными статусами, иначе операция будет отклонена.
                    </p>
                    
                    <div className="flex items-center gap-3 justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            Отмена
                        </SecondaryButton>
                        <DangerButton
                            onClick={handleDeleteCustomStatuses}
                            disabled={processing}
                        >
                            Удалить статусы
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
