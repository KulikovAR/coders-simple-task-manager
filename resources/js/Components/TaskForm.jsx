import { useForm } from '@inertiajs/react';
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/utils/statusUtils';
import { useState, useEffect, useRef } from 'react';
import TaskComments from '@/Components/TaskComments';
import RichTextEditor from '@/Components/RichTextEditor';
import TaskContentRenderer from '@/Components/TaskContentRenderer';
import TagsInput from '@/Components/TagsInput';
import Checklist from '@/Components/Checklist';

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
    processing = false,
    auth = null,
    onCommentAdded = null,
    onCommentUpdated = null,
    onCommentDeleted = null,
    autoSave = false
}) {
    const isEditing = !!task;

    // Таймер для дебаунса автосохранения
const autoSaveTimerRef = useRef(null);
// Флаг для отслеживания изменений
const [hasChanges, setHasChanges] = useState(false);
    // Делаем флаг доступным для внешнего доступа
    if (typeof window !== 'undefined') {
        window.taskFormHasChanges = hasChanges;
    }
    // Флаг для отслеживания процесса автосохранения
    const [autoSaving, setAutoSaving] = useState(false);

    // Состояние для чек-листов
    const [checklists, setChecklists] = useState(task?.checklists || []);
    const checklistRef = useRef(null);

// Функция для безопасного преобразования тегов в строку
    const tagsToString = (tags) => {
        if (!tags) return '';
        if (typeof tags === 'string') return tags;
        if (Array.isArray(tags)) return tags.join(' ');
        return String(tags);
    };

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
        tags: tagsToString(task?.tags),
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

            // Загружаем статусы задач с учетом контекста спринта
            const sprintParam = data.sprint_id ? `?sprint_id=${data.sprint_id}` : '';
            fetch(route('tasks.project.statuses', data.project_id) + sprintParam, {
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
                        const newData = { ...data, status_id: loadedStatuses[0].id };
                        setData('status_id', loadedStatuses[0].id);
                        triggerAutoSave(newData);
                    }
                    // Сбрасываем выбранный статус, если он не принадлежит новому проекту
                    else if (data.status_id && !loadedStatuses.find(s => s.id == data.status_id)) {
                        const firstStatus = loadedStatuses.length > 0 ? loadedStatuses[0].id : '';
                        const newData = { ...data, status_id: firstStatus };
                        setData('status_id', firstStatus);
                        triggerAutoSave(newData);
                    }
                    // Если все данные загружены, можно сохранить изменения
                    else if (data.project_id) {
                        triggerAutoSave(data);
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

    // Перезагружаем статусы при изменении спринта
    useEffect(() => {
        if (data.project_id) {
            const sprintParam = data.sprint_id ? `?sprint_id=${data.sprint_id}` : '';
            fetch(route('tasks.project.statuses', data.project_id) + sprintParam, {
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

                    // При смене спринта автоматически выбираем первый статус нового спринта
                    if (data.sprint_id !== task?.sprint_id) {
                        const firstStatus = loadedStatuses.length > 0 ? loadedStatuses[0].id : '';
                        const newData = { ...data, status_id: firstStatus };
                        setData('status_id', firstStatus);
                        // Запускаем автосохранение после обновления статуса
                        triggerAutoSave(newData);
                    } else if (data.status_id && !loadedStatuses.find(s => s.id == data.status_id)) {
                        // Сбрасываем выбранный статус, если он не принадлежит новому контексту
                        const firstStatus = loadedStatuses.length > 0 ? loadedStatuses[0].id : '';
                        const newData = { ...data, status_id: firstStatus };
                        setData('status_id', firstStatus);
                        // Запускаем автосохранение после обновления статуса
                        triggerAutoSave(newData);
                    } else if (data.sprint_id !== task?.sprint_id) {
                        // Если спринт изменился, но статус остался валидным, все равно сохраняем
                        triggerAutoSave(data);
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки статусов для спринта:', error);
                    setAvailableStatuses([]);
                });
        }
    }, [data.sprint_id]);

    // Функция для автосохранения с дебаунсом и обработкой зависимых полей
    const triggerAutoSave = (newData = null) => {
        if (!autoSave || !task?.id) return;

        // Очищаем предыдущий таймер
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Устанавливаем новый таймер (дебаунс 1000мс для более стабильной работы)
        setHasChanges(true);
        if (typeof window !== 'undefined') {
            window.taskFormHasChanges = true;
        }

        // Используем актуальные данные для сохранения
        const dataToSave = newData || data;

        autoSaveTimerRef.current = setTimeout(() => {
            if (onSubmit && !processing && !autoSaving) {
                setAutoSaving(true);

                // Проверяем зависимые поля перед сохранением
                const shouldSave = () => {
                    // Проверяем, загружены ли все необходимые данные для выбранного проекта
                    if (dataToSave.project_id) {
                        const hasValidStatus = !dataToSave.status_id || availableStatuses.some(s => s.id == dataToSave.status_id);
                        const hasValidSprint = !dataToSave.sprint_id || availableSprints.some(s => s.id == dataToSave.sprint_id);
                        const hasValidAssignee = !dataToSave.assignee_id || availableMembers.some(m => m.id == dataToSave.assignee_id);

                        return hasValidStatus && hasValidSprint && hasValidAssignee;
                    }
                    return true;
                };

                if (shouldSave()) {
                    onSubmit(dataToSave);

                    // Сбрасываем флаги после сохранения
                    setTimeout(() => {
                        setHasChanges(false);
                        setAutoSaving(false);
                        if (typeof window !== 'undefined') {
                            window.taskFormHasChanges = false;
                        }
                    }, 1000);
                } else {
                    // Если зависимые данные не готовы, отменяем автосохранение
                    setAutoSaving(false);
                    setHasChanges(false);
                    if (typeof window !== 'undefined') {
                        window.taskFormHasChanges = false;
                    }
                }
            }
        }, 1000);
    };

    // Модифицированный setData для автоматического сохранения с учетом зависимых полей
    const setDataWithAutoSave = (key, value) => {
        const newData = { ...data, [key]: value };
        setData(key, value);

        // Специальная обработка для зависимых полей
        if (key === 'project_id') {
            // При смене проекта сбрасываем зависимые поля
            newData.sprint_id = '';
            newData.status_id = '';
            newData.assignee_id = '';
            setData(prev => ({
                ...prev,
                sprint_id: '',
                status_id: '',
                assignee_id: ''
            }));
            // Откладываем автосохранение до загрузки зависимых данных
            return;
        } else if (key === 'sprint_id') {
            // При смене спринта не запускаем автосохранение здесь,
            // так как useEffect для sprint_id сам вызовет triggerAutoSave
            // после обновления статусов
            return;
        }

        // Для остальных полей запускаем автосохранение
        triggerAutoSave(newData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            // Получаем изменения чек-листов, если компонент существует
            let checklistData = null;
            if (checklistRef.current) {
                const localChanges = checklistRef.current.getLocalChanges();
                const currentItems = checklistRef.current.getItems();

                if (localChanges.length > 0 || currentItems.length > 0) {
                    checklistData = {
                        changes: localChanges,
                        items: currentItems
                    };
                }
            }

            // Передаем данные формы вместе с чек-листами
            const formData = {
                ...data,
                checklists: checklistData
            };

            onSubmit(formData);
            setHasChanges(false);
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
                    // Используем RichTextEditor для полей description и result
                    (fieldName === 'description' || fieldName === 'result') ? (
                        <RichTextEditor
                            value={data[fieldName]}
                            onChange={(value) => setDataWithAutoSave(fieldName, value)}
                            attachableType="App\\Models\\Task"
                            attachableId={task?.id || 'temp_' + Date.now()}
                            placeholder={options.placeholder || ''}
                            className={`w-full ${
                                hasError ? 'border-accent-red' : ''
                            }`}
                        />
                    ) : (
                        <textarea
                            id={fieldName}
                            value={data[fieldName]}
                            onChange={(e) => setDataWithAutoSave(fieldName, e.target.value)}
                            rows={options.rows || 4}
                            className={`${modalStyles.textarea} ${
                                hasError ? 'border-accent-red focus:ring-accent-red' : ''
                            }`}
                            placeholder={options.placeholder || ''}
                            required={options.required}
                        />
                    )
                ) : type === 'select' ? (
                    <select
                        id={fieldName}
                        value={data[fieldName]}
                        onChange={(e) => setDataWithAutoSave(fieldName, e.target.value)}
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
                        onChange={(e) => setDataWithAutoSave(fieldName, e.target.value)}
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

    if (isModal) {
        return (
            <form id="task-form" onSubmit={handleSubmit} className="h-full flex flex-col">
                {/* Основное содержимое */}
                <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
                    {/* Общие ошибки */}
                    {(errors.general || formErrors.general) && (
                        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 md:p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-accent-red mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-accent-red text-sm">{errors.general || formErrors.general}</p>
                            </div>
                        </div>
                    )}
                    {/* Основная информация и параметры в две колонки */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {/* Левая колонка - основная информация */}
                        <div className="md:col-span-2 space-y-4 md:space-y-6">
                        {/* Название задачи */}
                        <div>
                                                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setDataWithAutoSave('title', e.target.value)}
                                className="w-full text-lg md:text-xl font-semibold bg-transparent border-none px-0 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-0"
                                placeholder="Введите название задачи..."
                                required
                            />
                            <div className="h-px bg-border-color mt-2"></div>
                            {(formErrors.title || errors.title) && (
                                <p className="mt-2 text-sm text-accent-red">{formErrors.title || errors.title}</p>
                            )}
                        </div>

                        {/* Описание */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Описание
                            </label>
                                                            <RichTextEditor
                                    value={data.description}
                                    onChange={(value) => setDataWithAutoSave('description', value)}
                                    attachableType="App\\Models\\Task"
                                    attachableId={task?.id || 'temp_' + Date.now()}
                                    placeholder="Опишите задачу подробно... (поддерживается форматирование, изображения, ссылки и загрузка файлов)"
                                    className="w-full"
                                />
                            {(formErrors.description || errors.description) && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.description || errors.description}</p>
                            )}
                        </div>

                        {/* Дополнительные поля для редактирования */}
                        {isEditing && (
                            <>
                                {/* Результат */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-3">
                                        Результат выполнения
                                    </label>
                                    <RichTextEditor
                                        value={data.result}
                                        onChange={(value) => setDataWithAutoSave('result', value)}
                                        attachableType="App\\Models\\Task"
                                        attachableId={task?.id || 'temp_' + Date.now()}
                                        placeholder="Опишите что было сделано... (поддерживается форматирование, изображения, ссылки и загрузка файлов)"
                                        className="w-full"
                                    />
                                </div>

                                {/* Merge Request */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-3">
                                        Ссылка на Merge Request
                                    </label>
                                    <input
                                        type="url"
                                        value={data.merge_request}
                                        onChange={(e) => setDataWithAutoSave('merge_request', e.target.value)}
                                        className="w-full bg-secondary-bg border border-border-color rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                        placeholder="https://github.com/..."
                                    />
                                </div>

                            </>
                        )}
                    </div>

                    {/* Правая колонка - параметры задачи */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Быстрые действия */}
                        <div className="border border-border-color rounded-xl p-3 md:p-4">
                            <h3 className="text-sm font-medium text-text-primary mb-4">Параметры задачи</h3>
                            <div className="space-y-4">
                                {/* Теги */}
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                        Теги
                                    </label>
                                    <TagsInput
                                        value={data.tags}
                                        onChange={(value) => setDataWithAutoSave('tags', value)}
                                        placeholder="Введите теги..."
                                        className="bg-secondary-bg border-border-color text-sm"
                                    />
                                </div>

                                {/* Статус */}
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                        Статус
                                    </label>
                                    <select
                                        value={data.status_id}
                                        onChange={(e) => setDataWithAutoSave('status_id', e.target.value)}
                                        className="w-full bg-secondary-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all duration-150"
                                    >
                                        <option value="">Выберите статус</option>
                                        {availableStatuses.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Приоритет */}
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                        Приоритет
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(e) => setDataWithAutoSave('priority', e.target.value)}
                                        className="w-full bg-secondary-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                    >
                                        {priorities.map((priority) => (
                                            <option key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Исполнитель */}
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                        Исполнитель
                                    </label>
                                    <select
                                        value={data.assignee_id}
                                        onChange={(e) => setDataWithAutoSave('assignee_id', e.target.value)}
                                        className="w-full bg-secondary-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                    >
                                        <option value="">Не назначен</option>
                                        {availableMembers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Спринт */}
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                        Спринт
                                    </label>
                                    <select
                                        value={data.sprint_id}
                                        onChange={(e) => setDataWithAutoSave('sprint_id', e.target.value)}
                                        className="w-full bg-secondary-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                    >
                                        <option value="">Без спринта</option>
                                        {availableSprints.map((sprint) => (
                                            <option key={sprint.id} value={sprint.id}>
                                                {sprint.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Дедлайн */}
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                        Дедлайн
                                    </label>
                                    <input
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) => setDataWithAutoSave('deadline', e.target.value)}
                                        className="w-full bg-secondary-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Проект (скрытый в редактировании) */}
                        {!isEditing && (
                            <div className="bg-card-bg border border-border-color rounded-xl p-4">
                                <h3 className="text-sm font-medium text-text-primary mb-4">Размещение</h3>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                        Проект
                                    </label>
                                    <select
                                        value={data.project_id}
                                        onChange={(e) => setDataWithAutoSave('project_id', e.target.value)}
                                        className="w-full bg-secondary-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                        required
                                    >
                                        <option value="">Выберите проект</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>

                    {/* Комментарии - на всю ширину */}
                    {task?.id && auth && (
                        <div className="bg-secondary-bg border border-border-color rounded-lg p-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-text-primary">Комментарии</h3>
                                <p className="text-sm text-text-secondary">Обсудите задачу с командой</p>
                            </div>
                            <TaskComments
                                task={task}
                                comments={task.comments || []}
                                auth={auth}
                                users={members}
                                compact={true}
                                onCommentAdded={onCommentAdded}
                                onCommentUpdated={onCommentUpdated}
                                onCommentDeleted={onCommentDeleted}
                            />
                        </div>
                    )}

                    {/* Свободная область под комментариями для мобильных устройств */}
                    {isModal && (
                        <div className="h-20 lg:h-0"></div>
                    )}
                </div>

                {/* Индикатор автосохранения - показываем только при активном сохранении */}
                {autoSave && task?.id && autoSaving && (
                    <div className="fixed bottom-4 right-4 bg-accent-blue/90 text-text-inverse px-2 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 z-50 animate-fade-in">
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs font-medium">Сохранение...</span>
                    </div>
                )}
            </form>
        );
    }

    // Обычная форма для не-модального режима
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
                            {/* Результат*/}
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
                            {/* Теги */}
                            <div>
                                <label htmlFor="tags" className={modalStyles.label}>
                                    Теги
                                </label>
                                <TagsInput
                                    value={data.tags}
                                    onChange={(value) => setDataWithAutoSave('tags', value)}
                                    placeholder="Введите теги..."
                                    className=""
                                />
                                {(formErrors.tags || errors.tags) && (
                                    <p className={modalStyles.error}>{formErrors.tags || errors.tags}</p>
                                )}
                            </div>

                            {/* Проект - показываем только при создании */}
                            {!isEditing && renderField('project_id', 'Проект *', 'select', {
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

            {/* Кнопки формы (только для полной формы, не для модалки) */}
            {!isModal && (
                <div className={modalStyles.buttonContainer}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={modalStyles.cancelButton}
                        disabled={processing}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className={modalStyles.submitButton}
                        disabled={processing}
                    >
                        {processing ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Создать')}
                    </button>
                </div>
            )}
        </form>
    );
}
