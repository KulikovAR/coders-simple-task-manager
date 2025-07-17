import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/utils/statusUtils';
import { useState, useEffect } from 'react';

export default function Form({ auth, task = null, projects = [], selectedProjectId = null, selectedSprintId = null, sprints = [], errors = {} }) {
    const isEditing = !!task;
    const [availableSprints, setAvailableSprints] = useState(sprints);

    // Приводим selectedProjectId к числу для корректного сравнения
    const defaultProjectId = selectedProjectId ? parseInt(selectedProjectId) : null;
    const defaultSprintId = selectedSprintId ? parseInt(selectedSprintId) : null;

    const { data, setData, post, put, processing, errors: formErrors } = useForm({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status?.name || 'To Do',
        priority: task?.priority || '',
        project_id: task?.project_id || defaultProjectId || '',
        sprint_id: task?.sprint_id || defaultSprintId || '',
        deadline: task?.deadline ? task.deadline.split('T')[0] : '',
        result: task?.result || '',
        merge_request: task?.merge_request || '',
    });

    // Загружаем спринты при изменении проекта
    useEffect(() => {
        if (data.project_id) {
            fetch(route('tasks.project.sprints', data.project_id))
                .then(response => response.json())
                .then(sprints => {
                    setAvailableSprints(sprints);
                    // Сбрасываем выбранный спринт, если он не принадлежит новому проекту
                    if (data.sprint_id && !sprints.find(s => s.id == data.sprint_id)) {
                        setData('sprint_id', '');
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки спринтов:', error);
                    setAvailableSprints([]);
                });
        } else {
            setAvailableSprints([]);
            setData('sprint_id', '');
        }
    }, [data.project_id]);

    // Устанавливаем проект по умолчанию при первой загрузке
    useEffect(() => {
        if (!isEditing && defaultProjectId && !data.project_id) {
            setData('project_id', defaultProjectId);
        }
    }, [defaultProjectId, isEditing]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('tasks.update', task.id), data);
        } else {
            post(route('tasks.store'), data);
        }
    };

    // Получаем опции для селектов
    const taskStatuses = getTaskStatusOptions();
    const priorities = getTaskPriorityOptions();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    {isEditing ? 'Редактировать задачу' : 'Новая задача'}
                </h2>
            }
        >
            <Head title={isEditing ? 'Редактировать задачу' : 'Новая задача'} />

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Заголовок и действия */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">
                                {isEditing ? 'Редактирование задачи' : 'Создание новой задачи'}
                            </h1>
                            {isEditing && task?.code && (
                                <div className="text-xs font-mono text-accent-blue mb-2">{task.code}</div>
                            )}
                            <p className="text-text-secondary">
                                {isEditing ? 'Обновите информацию о задаче' : 'Заполните основную информацию о задаче'}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <a
                                href={route('tasks.index')}
                                className="btn btn-secondary"
                            >
                                Отмена
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn btn-primary"
                            >
                                {processing ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
                            </button>
                        </div>
                    </div>

                    {/* Основная информация */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Основные поля */}
                            <div className="card">
                                <h3 className="card-title mb-4">Основная информация</h3>
                                <div className="space-y-4">
                                    {/* Название */}
                                    <div>
                                        <label htmlFor="title" className="form-label">
                                            Название задачи *
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className={`form-input ${
                                                formErrors.title ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                            placeholder="Введите название задачи"
                                        />
                                        {formErrors.title && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.title}</p>
                                        )}
                                    </div>

                                    {/* Описание */}
                                    <div>
                                        <label htmlFor="description" className="form-label">
                                            Описание
                                        </label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                            className={`form-input ${
                                                formErrors.description ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                            placeholder="Опишите задачу..."
                                        />
                                        {formErrors.description && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Дополнительные поля (только для редактирования) */}
                            {isEditing && (
                                <>
                                    {/* Результат */}
                                    <div className="card">
                                        <h3 className="card-title mb-4">Результат выполнения</h3>
                                        <div>
                                            <label htmlFor="result" className="form-label">
                                                Результат
                                            </label>
                                            <textarea
                                                id="result"
                                                value={data.result}
                                                onChange={(e) => setData('result', e.target.value)}
                                                rows={3}
                                                className={`form-input ${
                                                    formErrors.result ? 'border-accent-red focus:ring-accent-red' : ''
                                                }`}
                                                placeholder="Опишите результат выполнения задачи..."
                                            />
                                            {formErrors.result && (
                                                <p className="mt-1 text-sm text-accent-red">{formErrors.result}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Merge Request */}
                                    <div className="card">
                                        <h3 className="card-title mb-4">Ссылки</h3>
                                        <div>
                                            <label htmlFor="merge_request" className="form-label">
                                                Ссылка на Merge Request
                                            </label>
                                            <input
                                                id="merge_request"
                                                type="url"
                                                value={data.merge_request}
                                                onChange={(e) => setData('merge_request', e.target.value)}
                                                className={`form-input ${
                                                    formErrors.merge_request ? 'border-accent-red focus:ring-accent-red' : ''
                                                }`}
                                                placeholder="https://github.com/..."
                                            />
                                            {formErrors.merge_request && (
                                                <p className="mt-1 text-sm text-accent-red">{formErrors.merge_request}</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Боковая панель */}
                        <div className="space-y-6">
                            {/* Параметры задачи */}
                            <div className="card">
                                <h3 className="card-title mb-4">Параметры задачи</h3>
                                <div className="space-y-4">
                                    {/* Проект */}
                                    <div>
                                        <label htmlFor="project_id" className="form-label">
                                            Проект *
                                        </label>
                                        <select
                                            id="project_id"
                                            value={data.project_id}
                                            onChange={(e) => setData('project_id', e.target.value)}
                                            className={`form-select ${
                                                formErrors.project_id ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        >
                                            <option value="">Выберите проект</option>
                                            {projects.map((project) => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.project_id && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.project_id}</p>
                                        )}
                                    </div>

                                    {/* Спринт */}
                                    <div>
                                        <label htmlFor="sprint_id" className="form-label">
                                            Спринт
                                        </label>
                                        <select
                                            id="sprint_id"
                                            value={data.sprint_id}
                                            onChange={(e) => setData('sprint_id', e.target.value)}
                                            className={`form-select ${
                                                formErrors.sprint_id ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        >
                                            <option value="">Без спринта</option>
                                            {availableSprints.map((sprint) => (
                                                <option key={sprint.id} value={sprint.id}>
                                                    {sprint.name} ({new Date(sprint.start_date).toLocaleDateString('ru-RU')} - {new Date(sprint.end_date).toLocaleDateString('ru-RU')})
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.sprint_id && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.sprint_id}</p>
                                        )}
                                    </div>

                                    {/* Статус */}
                                    <div>
                                        <label htmlFor="status" className="form-label">
                                            Статус
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className={`form-select ${
                                                formErrors.status ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        >
                                            {taskStatuses.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.status && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.status}</p>
                                        )}
                                    </div>

                                    {/* Приоритет */}
                                    <div>
                                        <label htmlFor="priority" className="form-label">
                                            Приоритет
                                        </label>
                                        <select
                                            id="priority"
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className={`form-select ${
                                                formErrors.priority ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        >
                                            {priorities.map((priority) => (
                                                <option key={priority.value} value={priority.value}>
                                                    {priority.label}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.priority && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.priority}</p>
                                        )}
                                    </div>

                                    {/* Дедлайн */}
                                    <div>
                                        <label htmlFor="deadline" className="form-label">
                                            Дедлайн
                                        </label>
                                        <input
                                            id="deadline"
                                            type="date"
                                            value={data.deadline}
                                            onChange={(e) => setData('deadline', e.target.value)}
                                            className={`form-input ${
                                                formErrors.deadline ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        />
                                        {formErrors.deadline && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.deadline}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Информация */}
                            <div className="card">
                                <h3 className="card-title mb-4">Информация</h3>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <p>• Поля "Результат" и "Merge Request" будут доступны после создания задачи</p>
                                    <p>• Статус можно изменить в процессе работы</p>
                                    <p>• Приоритет поможет определить очередность выполнения</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
} 