import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { getSprintStatusLabel, getSprintStatusClass, getSprintStatusIcon, formatSprintDates } from '@/utils/sprintUtils';
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/utils/statusUtils';

export default function Board({ auth, project, tasks, taskStatuses, sprints = [], members = [] }) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [selectedSprintId, setSelectedSprintId] = useState('all');
    const [assigneeId, setAssigneeId] = useState('');
    const [myTasks, setMyTasks] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Форма для редактирования задачи
    const { data, setData, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        result: '',
        merge_request: '',
        priority: '',
        assignee_id: '',
        deadline: '',
        sprint_id: '',
    });

    // Открытие модального окна с задачей
    const openTaskModal = (task) => {
        setSelectedTask(task);
        setData({
            title: task.title || '',
            description: task.description || '',
            result: task.result || '',
            merge_request: task.merge_request || '',
            priority: task.priority || '',
            assignee_id: task.assignee_id || '',
            deadline: task.deadline ? task.deadline.split('T')[0] : '',
            sprint_id: task.sprint_id || '',
        });
        setShowTaskModal(true);
    };

    // Закрытие модального окна
    const closeTaskModal = () => {
        setShowTaskModal(false);
        setSelectedTask(null);
        reset();
    };

    // Сохранение изменений задачи
    const handleTaskUpdate = (e) => {
        e.preventDefault();
        
        // Получаем CSRF-токен
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                         document.querySelector('input[name="_token"]')?.value ||
                         window.csrf_token;
        
        fetch(route('tasks.update', selectedTask.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Обновляем задачу в списке без перезагрузки страницы
                if (result.task) {
                    const updatedTask = result.task;
                    // Находим и обновляем задачу в списке
                    const taskIndex = tasks.findIndex(t => t.id === updatedTask.id);
                    if (taskIndex !== -1) {
                        tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
                    }
                }
                closeTaskModal();
            }
        })
        .catch(error => {
            console.error('Ошибка сохранения:', error);
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-gray-600 text-white';
            case 'completed':
                return 'bg-gray-700 text-white';
            case 'on_hold':
                return 'bg-gray-500 text-white';
            case 'cancelled':
                return 'bg-gray-800 text-white';
            default:
                return 'bg-gray-500 text-white';
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

    // Улучшенные цвета приоритетов с индикаторами
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'text-green-400 border-green-400 bg-green-400/10';
            case 'medium':
                return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
            case 'high':
                return 'text-red-400 border-red-400 bg-red-400/10';
            default:
                return 'text-gray-400 border-gray-400 bg-gray-400/10';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'low':
                return 'Низкий';
            case 'medium':
                return 'Средний';
            case 'high':
                return 'Высокий';
            default:
                return priority;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'low':
                return '⬇️';
            case 'medium':
                return '➡️';
            case 'high':
                return '⬆️';
            default:
                return '•';
        }
    };

    // Цвета статусов для индикаторов
    const getStatusIndicatorColor = (statusName) => {
        switch (statusName) {
            case 'To Do':
                return 'bg-gray-500';
            case 'In Progress':
                return 'bg-blue-500';
            case 'Review':
                return 'bg-yellow-500';
            case 'Testing':
                return 'bg-purple-500';
            case 'Ready for Release':
                return 'bg-pink-500';
            case 'Done':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, statusId) => {
        e.preventDefault();

        if (draggedTask && draggedTask.status_id !== statusId) {
            router.put(route('tasks.status.update', draggedTask.id), {
                status_id: statusId
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setDraggedTask(null);
                }
            });
        }
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
    };

    // Фильтрация задач по спринту и исполнителю
    const filteredTasks = tasks.filter(task => {
        const sprintOk = selectedSprintId === 'all' || task.sprint_id == selectedSprintId;
        const assigneeOk = assigneeId ? String(task.assignee_id) === String(assigneeId) : true;
        const myOk = myTasks ? String(task.assignee_id) === String(auth.user.id) : true;
        return sprintOk && assigneeOk && myOk;
    });

    const getFilteredStatusTasks = (statusId) => {
        return filteredTasks.filter(task => task.status_id === statusId);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Доска задач</h2>}
        >
            <Head title={`${project.name} - Доска`} />

            <div className="space-y-6">
                {/* Шапка доски: структурированная, всё по центру */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center mb-6 shadow-lg">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest text-center" style={{ letterSpacing: '0.2em' }}>
                        {project.name}
                    </h1>
                    {project.description && (
                        <p className="text-gray-300 text-base font-normal mt-2 mb-0 whitespace-pre-wrap max-w-xl text-center">{project.description}</p>
                    )}
                    <div className="flex flex-wrap justify-center items-center gap-4 text-base text-gray-400 font-medium mt-3 mb-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>{getStatusText(project.status)}</span>
                        {project.deadline && (
                            <span>Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                        )}
                    </div>
                </div>

                {/* Фильтр по спринтам */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Фильтр по спринтам</h3>
                        <Link
                            href={route('sprints.create', project.id)}
                            className="text-white hover:text-gray-300 text-sm font-medium"
                        >
                            + Создать спринт
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedSprintId('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedSprintId === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            Все задачи
                        </button>
                        {sprints.map((sprint) => (
                            <button
                                key={sprint.id}
                                onClick={() => setSelectedSprintId(sprint.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                                    selectedSprintId == sprint.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <span>{getSprintStatusIcon(sprint.status)}</span>
                                <span>{sprint.name}</span>
                                <span className="text-xs opacity-75">
                                    ({formatSprintDates(sprint)})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Фильтры по исполнителю и мои задачи */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div>
                            <label className="form-label text-white">Исполнитель</label>
                            <select
                                value={assigneeId}
                                onChange={e => setAssigneeId(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Все исполнители</option>
                                {members.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} {user.email ? `(${user.email})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                            <input
                                type="checkbox"
                                id="my_tasks"
                                checked={myTasks}
                                onChange={e => setMyTasks(e.target.checked)}
                                className="form-checkbox"
                            />
                            <label htmlFor="my_tasks" className="text-sm text-white">Мои задачи</label>
                        </div>
                    </div>
                </div>

                {/* Kanban доска */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">
                            Доска задач
                            {selectedSprintId !== 'all' && (
                                <span className="text-sm text-gray-400 ml-2">
                                    (фильтр: {sprints.find(s => s.id == selectedSprintId)?.name})
                                </span>
                            )}
                        </h3>
                        <Link
                            href={route('tasks.create', { project_id: project.id })}
                            className="text-white hover:text-gray-300 text-sm font-medium"
                        >
                            + Добавить задачу
                        </Link>
                    </div>

                    {/* Горизонтальный скролл для колонок */}
                    <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                        {taskStatuses.map((status) => {
                            const statusTasks = getFilteredStatusTasks(status.id);
                            return (
                                <div
                                    key={status.id}
                                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-shrink-0 w-56 md:w-64 lg:w-72 min-h-[300px] max-h-full"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, status.id)}
                                >
                                    {/* Заголовок колонки с индикатором */}
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${getStatusIndicatorColor(status.name)}`}></div>
                                            <h4 className="text-white font-medium">{status.name}</h4>
                                        </div>
                                        <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full font-medium">
                                            {statusTasks.length}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {statusTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-move hover:bg-gray-600 hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => openTaskModal(task)}
                                            >
                                                {/* Код задачи */}
                                                {task.code && (
                                                    <div className="text-xs font-mono text-blue-400 mb-2 font-bold flex items-center">
                                                        <span className="mr-1">🔗</span>
                                                        {task.code}
                                                    </div>
                                                )}

                                                {/* Заголовок задачи */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="text-white font-medium text-sm leading-tight">
                                                        <Link
                                                            href={route('tasks.show', task.id)}
                                                            className="hover:text-blue-300 transition-colors"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {task.title}
                                                        </Link>
                                                    </h5>
                                                </div>

                                                {/* Описание */}
                                                {task.description && (
                                                    <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}

                                                {/* Мета-информация */}
                                                <div className="space-y-2">
                                                    {/* Приоритет с иконкой */}
                                                    {task.priority && (
                                                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                                                            <span>{getPriorityIcon(task.priority)}</span>
                                                            <span>{getPriorityText(task.priority)}</span>
                                                        </div>
                                                    )}

                                                    {/* Исполнитель */}
                                                    {task.assignee && (
                                                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                            <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                                {task.assignee.name.charAt(0)}
                                                            </span>
                                                            <span>{task.assignee.name}</span>
                                                        </div>
                                                    )}

                                                    {/* Дедлайн с предупреждением */}
                                                    {task.deadline && (
                                                        <div className="flex items-center space-x-1 text-xs">
                                                            <span className="text-gray-400">📅</span>
                                                            <span className={`${
                                                                new Date(task.deadline) < new Date()
                                                                    ? 'text-red-400 font-medium'
                                                                    : 'text-gray-400'
                                                            }`}>
                                                                {new Date(task.deadline).toLocaleDateString('ru-RU')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Информация о спринте */}
                                                {task.sprint && (
                                                    <div className="mt-3 pt-2 border-t border-gray-600">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-400 flex items-center">
                                                                <span className="mr-1">🏃</span>
                                                                Спринт:
                                                            </span>
                                                            <Link
                                                                href={route('sprints.show', [project.id, task.sprint.id])}
                                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {task.sprint.name}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Модальное окно для просмотра и редактирования задачи */}
            {showTaskModal && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Редактирование задачи</h2>
                                    {selectedTask.code && (
                                        <div className="text-sm font-mono text-blue-400">{selectedTask.code}</div>
                                    )}
                                </div>
                                <button
                                    onClick={closeTaskModal}
                                    className="text-gray-400 hover:text-white text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleTaskUpdate} className="space-y-6">
                                {/* Название */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Название задачи *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                        placeholder="Введите название задачи"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                                    )}
                                </div>

                                {/* Описание */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                        placeholder="Опишите задачу..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                                    )}
                                </div>

                                {/* Результат */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Результат выполнения
                                    </label>
                                    <textarea
                                        value={data.result}
                                        onChange={(e) => setData('result', e.target.value)}
                                        rows={3}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                        placeholder="Опишите результат выполнения задачи..."
                                    />
                                    {errors.result && (
                                        <p className="mt-1 text-sm text-red-400">{errors.result}</p>
                                    )}
                                </div>

                                {/* Ссылка на Merge Request */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Ссылка на Merge Request
                                    </label>
                                    <input
                                        type="url"
                                        value={data.merge_request}
                                        onChange={(e) => setData('merge_request', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                        placeholder="https://github.com/..."
                                    />
                                    {errors.merge_request && (
                                        <p className="mt-1 text-sm text-red-400">{errors.merge_request}</p>
                                    )}
                                </div>

                                {/* Приоритет */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Приоритет
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                    >
                                        <option value="">Выберите приоритет</option>
                                        {getTaskPriorityOptions().map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    {errors.priority && (
                                        <p className="mt-1 text-sm text-red-400">{errors.priority}</p>
                                    )}
                                </div>

                                {/* Исполнитель */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Исполнитель
                                    </label>
                                    <select
                                        value={data.assignee_id}
                                        onChange={(e) => setData('assignee_id', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                    >
                                        <option value="">Выберите исполнителя</option>
                                        {members.map(user => (
                                            <option key={user.id} value={user.id}>{user.name} {user.email ? `(${user.email})` : ''}</option>
                                        ))}
                                    </select>
                                    {errors.assignee_id && (
                                        <p className="mt-1 text-sm text-red-400">{errors.assignee_id}</p>
                                    )}
                                </div>

                                {/* Дедлайн */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Дедлайн
                                    </label>
                                    <input
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                    />
                                    {errors.deadline && (
                                        <p className="mt-1 text-sm text-red-400">{errors.deadline}</p>
                                    )}
                                </div>

                                {/* Спринт */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Спринт
                                    </label>
                                    <select
                                        value={data.sprint_id}
                                        onChange={(e) => setData('sprint_id', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                    >
                                        <option value="">Выберите спринт</option>
                                        {sprints.map(sprint => (
                                            <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                                        ))}
                                    </select>
                                    {errors.sprint_id && (
                                        <p className="mt-1 text-sm text-red-400">{errors.sprint_id}</p>
                                    )}
                                </div>

                                {/* Кнопки */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                                    <button
                                        type="button"
                                        onClick={closeTaskModal}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
