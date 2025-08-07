import { useForm } from '@inertiajs/react';
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/utils/statusUtils';
import { useState, useEffect } from 'react';

export default function TaskForm({ 
    task = null, 
    projects = [], 
    sprints = [], 
    members = [], 
    taskStatuses = [],
    errors = {}, 
    onSubmit, 
    onCancel, 
    isModal = false,
    processing = false 
}) {
    const isEditing = !!task;

    const { data, setData, errors: formErrors } = useForm({
        title: task?.title || '',
        description: task?.description || '',
        status_id: task?.status_id || '',
        priority: task?.priority || '',
        project_id: task?.project_id || '',
        sprint_id: task?.sprint_id || '',
        assignee_id: task?.assignee_id || '',
        deadline: task?.deadline ? task.deadline.split('T')[0] : '',
        result: task?.result || '',
        merge_request: task?.merge_request || '',
    });

    // Устанавливаем значения по умолчанию для project_id и sprint_id при создании
    useEffect(() => {
        if (!isEditing && task) {
            if (task.project_id) {
                setData('project_id', task.project_id);
            }
            if (task.sprint_id) {
                setData('sprint_id', task.sprint_id);
            }
        }
    }, [task, isEditing]);

    const [availableSprints, setAvailableSprints] = useState(sprints);
    const [availableMembers, setAvailableMembers] = useState(members);
    const [availableStatuses, setAvailableStatuses] = useState(taskStatuses);

    // Загружаем спринты, участников и статусы при изменении проекта
    useEffect(() => {
        if (data.project_id) {
            // Загружаем спринты
            fetch(route('tasks.project.sprints', data.project_id), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(responseJson => {
                    let loadedSprints = [];
                    if (Array.isArray(responseJson)) {
                        loadedSprints = responseJson;
                    } else if (responseJson && typeof responseJson === 'object' && Array.isArray(responseJson.sprints)) {
                        loadedSprints = responseJson.sprints;
                    } else if (responseJson && typeof responseJson === 'object' && responseJson.sprints) {
                        loadedSprints = Array.isArray(responseJson.sprints) ? responseJson.sprints : [];
                    }

                    setAvailableSprints(loadedSprints);

                    // Сбрасываем выбранный спринт, если он не принадлежит новому проекту
                    if (data.sprint_id && !loadedSprints.find(s => s.id == data.sprint_id)) {
                        setData('sprint_id', '');
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки спринтов:', error);
                    setAvailableSprints([]);
                });

            // Загружаем статусы задач
            fetch(route('tasks.project.statuses', data.project_id), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(responseJson => {
                    let loadedStatuses = [];
                    if (Array.isArray(responseJson)) {
                        loadedStatuses = responseJson;
                    } else if (responseJson && typeof responseJson === 'object' && Array.isArray(responseJson.taskStatuses)) {
                        loadedStatuses = responseJson.taskStatuses;
                    } else if (responseJson && typeof responseJson === 'object' && responseJson.taskStatuses) {
                        loadedStatuses = Array.isArray(responseJson.taskStatuses) ? responseJson.taskStatuses : [];
                    }

                    setAvailableStatuses(loadedStatuses);

                    // Если нет выбранного статуса и это создание задачи, выбираем первый статус
                    if (!isEditing && !data.status_id && loadedStatuses.length > 0) {
                        setData('status_id', loadedStatuses[0].id);
                    }
                    // Сбрасываем выбранный статус, если он не принадлежит новому проекту
                    else if (data.status_id && !loadedStatuses.find(s => s.id == data.status_id)) {
                        const firstStatus = loadedStatuses.length > 0 ? loadedStatuses[0].id : '';
                        setData('status_id', firstStatus);
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки статусов:', error);
                    setAvailableStatuses([]);
                });

            // Загружаем участников проекта
            fetch(route('projects.members', data.project_id), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(responseJson => {
                    let loadedMembers = [];
                    if (Array.isArray(responseJson)) {
                        loadedMembers = responseJson;
                    } else if (responseJson && typeof responseJson === 'object' && Array.isArray(responseJson.members)) {
                        loadedMembers = responseJson.members;
                    } else if (responseJson && typeof responseJson === 'object' && responseJson.members) {
                        loadedMembers = Array.isArray(responseJson.members) ? responseJson.members : [];
                    }

                    setAvailableMembers(loadedMembers);

                    // Сбрасываем выбранного исполнителя, если он не принадлежит новому проекту
                    if (data.assignee_id && !loadedMembers.find(m => m.id == data.assignee_id)) {
                        setData('assignee_id', '');
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки участников:', error);
                    setAvailableMembers([]);
                });
        } else {
            setAvailableSprints([]);
            setAvailableMembers([]);
            setAvailableStatuses([]);
            setData('sprint_id', '');
            setData('assignee_id', '');
            setData('status_id', '');
        }
    }, [data.project_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(data);
        }
    };

    // Получаем опции для селектов
    const priorities = getTaskPriorityOptions();

    // Стили для модалки
    const modalStyles = {
        container: isModal ? "space-y-4" : "space-y-6",
        card: isModal ? "" : "card",
        cardTitle: isModal ? "text-lg font-semibold text-text-primary mb-3" : "card-title mb-4",
        input: isModal 
            ? "w-full bg-card-bg border border-border-color rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            : "form-input",
        select: isModal 
            ? "w-full bg-card-bg border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            : "form-select",
        textarea: isModal 
            ? "w-full bg-card-bg border border-border-color rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            : "form-input",
        label: isModal 
            ? "block text-sm font-medium text-text-primary mb-2"
            : "form-label",
        error: isModal 
            ? "mt-1 text-sm text-accent-red"
            : "mt-1 text-sm text-accent-red",
        buttonContainer: isModal 
            ? "flex justify-end space-x-3 pt-4 border-t border-border-color"
            : "flex justify-end space-x-3 mb-6 pb-4 border-b border-border-color",
        cancelButton: isModal 
            ? "btn btn-secondary"
            : "btn btn-secondary",
        submitButton: isModal 
            ? "btn btn-primary"
            : "btn btn-primary"
    };

    const renderField = (fieldName, label, type = 'text', options = {}) => {
        const hasError = (formErrors[fieldName] || errors[fieldName]);
        const errorMessage = formErrors[fieldName] || errors[fieldName];
        
        return (
            <div>
                <label htmlFor={fieldName} className={modalStyles.label}>
                    {label}
                </label>
                {type === 'textarea' ? (
                    <textarea
                        id={fieldName}
                        value={data[fieldName]}
                        onChange={(e) => setData(fieldName, e.target.value)}
                        rows={options.rows || 4}
                        className={`${modalStyles.textarea} ${
                            hasError ? 'border-accent-red focus:ring-accent-red' : ''
                        }`}
                        placeholder={options.placeholder || ''}
                        required={options.required}
                    />
                ) : type === 'select' ? (
                    <select
                        id={fieldName}
                        value={data[fieldName]}
                        onChange={(e) => setData(fieldName, e.target.value)}
                        className={`${modalStyles.select} ${
                            hasError ? 'border-accent-red focus:ring-accent-red' : ''
                        }`}
                        required={options.required}
                    >
                        {options.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        id={fieldName}
                        type={type}
                        value={data[fieldName]}
                        onChange={(e) => setData(fieldName, e.target.value)}
                        className={`${modalStyles.input} ${
                            hasError ? 'border-accent-red focus:ring-accent-red' : ''
                        }`}
                        placeholder={options.placeholder || ''}
                        required={options.required}
                    />
                )}
                {errorMessage && (
                    <p className={modalStyles.error}>{errorMessage}</p>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className={modalStyles.container}>
            {/* Кнопки действий */}
            <div className={modalStyles.buttonContainer}>
                <button
                    type="button"
                    onClick={onCancel}
                    className={modalStyles.cancelButton}
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className={modalStyles.submitButton}
                >
                    {processing ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
                </button>
            </div>

            {/* Основная информация */}
            <div className={isModal ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                <div className={isModal ? "" : "lg:col-span-2 space-y-6"}>
                    {/* Основные поля */}
                    <div className={modalStyles.card}>
                        <h3 className={modalStyles.cardTitle}>Основная информация</h3>
                        <div className="space-y-4">
                            {renderField('title', 'Название задачи *', 'text', {
                                placeholder: 'Введите название задачи',
                                required: true
                            })}

                            {renderField('description', 'Описание', 'textarea', {
                                placeholder: 'Опишите задачу...',
                                rows: 4
                            })}
                        </div>
                    </div>

                    {/* Дополнительные поля (только для редактирования) */}
                    {isEditing && (
                        <>
                            {/* Результат */}
                            <div className={modalStyles.card}>
                                <h3 className={modalStyles.cardTitle}>Результат выполнения</h3>
                                {renderField('result', 'Результат', 'textarea', {
                                    placeholder: 'Опишите результат выполнения задачи...',
                                    rows: 3
                                })}
                            </div>

                            {/* Merge Request */}
                            <div className={modalStyles.card}>
                                <h3 className={modalStyles.cardTitle}>Ссылки</h3>
                                {renderField('merge_request', 'Ссылка на Merge Request', 'url', {
                                    placeholder: 'https://github.com/...'
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Боковая панель */}
                <div className={isModal ? "space-y-4" : "space-y-6"}>
                    {/* Параметры задачи */}
                    <div className={modalStyles.card}>
                        <h3 className={modalStyles.cardTitle}>Параметры задачи</h3>
                        <div className="space-y-4">
                            {/* Проект */}
                            {renderField('project_id', 'Проект *', 'select', {
                                options: [
                                    { value: '', label: 'Выберите проект' },
                                    ...projects.map((project) => ({
                                        value: project.id,
                                        label: project.name
                                    }))
                                ],
                                required: true
                            })}

                            {/* Спринт */}
                            {renderField('sprint_id', 'Спринт', 'select', {
                                options: [
                                    { value: '', label: 'Без спринта' },
                                    ...availableSprints.map((sprint) => ({
                                        value: sprint.id,
                                        label: `${sprint.name} (${new Date(sprint.start_date).toLocaleDateString('ru-RU')} - ${new Date(sprint.end_date).toLocaleDateString('ru-RU')})`
                                    }))
                                ]
                            })}

                            {/* Статус */}
                            {renderField('status_id', 'Статус', 'select', {
                                options: [
                                    { value: '', label: 'Выберите статус' },
                                    ...availableStatuses.map((status) => ({
                                        value: status.id,
                                        label: status.name
                                    }))
                                ]
                            })}

                            {/* Приоритет */}
                            {renderField('priority', 'Приоритет', 'select', {
                                options: priorities
                            })}

                            {/* Исполнитель */}
                            {renderField('assignee_id', 'Исполнитель', 'select', {
                                options: [
                                    { value: '', label: 'Не назначен' },
                                    ...availableMembers.map((user) => ({
                                        value: user.id,
                                        label: `${user.name} ${user.email ? `(${user.email})` : ''}`
                                    }))
                                ]
                            })}

                            {/* Дедлайн */}
                            {renderField('deadline', 'Дедлайн', 'date')}
                        </div>
                    </div>

                    {/* Информация (только для полной формы) */}
                    {!isModal && (
                        <div className={modalStyles.card}>
                            <h3 className={modalStyles.cardTitle}>Информация</h3>
                            <div className="space-y-2 text-sm text-text-secondary">
                                <p>• Поля "Результат" и "Merge Request" будут доступны после создания задачи</p>
                                <p>• Статус можно изменить в процессе работы</p>
                                <p>• Приоритет поможет определить очередность выполнения</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
} 