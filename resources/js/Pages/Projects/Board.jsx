import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/utils/statusUtils';
import TaskForm from '@/Components/TaskForm';

export default function Board({ auth, project, tasks, taskStatuses, sprints = [], members = [] }) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [selectedSprintId, setSelectedSprintId] = useState('all');
    const [assigneeId, setAssigneeId] = useState('');
    const [myTasks, setMyTasks] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [localTasks, setLocalTasks] = useState(tasks);
    const [dragOverStatusId, setDragOverStatusId] = useState(null);

    // Обновляем локальные задачи при изменении props
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    // Обработка клавиши Escape для закрытия модалки
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showTaskModal) {
                closeTaskModal();
            }
        };

        if (showTaskModal) {
            document.addEventListener('keydown', handleEscape);
            // Блокируем прокрутку body при открытой модалке
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showTaskModal]);

    // Дополнительная проверка состояния при изменении задач
    useEffect(() => {
        // Если draggedTask больше не существует в задачах, сбрасываем его
        if (draggedTask && !localTasks.find(task => task.id === draggedTask.id)) {
            setDraggedTask(null);
        }
    }, [localTasks, draggedTask]);

    const openTaskModal = (task) => {
        setSelectedTask(task);
        setShowTaskModal(true);
        setErrors({});
    };

    const closeTaskModal = () => {
        setShowTaskModal(false);
        setSelectedTask(null);
        setErrors({});
    };

    const handleTaskUpdate = (data) => {
        setProcessing(true);
        setErrors({});

        router.put(route('tasks.update', selectedTask.id), data, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                // Обновляем задачу в локальном состоянии
                setLocalTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === selectedTask.id 
                            ? { ...task, ...data }
                            : task
                    )
                );
                closeTaskModal();
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
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

    const handleDragOver = (e, statusId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverStatusId(statusId);
    };

    const handleDragLeave = (e, statusId) => {
        e.preventDefault();
        // Проверяем, что мы действительно покидаем область, а не переходим к дочернему элементу
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverStatusId(null);
        }
    };

    const handleDrop = (e, statusId) => {
        e.preventDefault();
        setDragOverStatusId(null);

        if (draggedTask && draggedTask.status_id !== statusId) {
            router.put(route('tasks.status.update', draggedTask.id), {
                status_id: statusId
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Обновляем задачу в локальном состоянии
                    setLocalTasks(prevTasks => 
                        prevTasks.map(task => 
                            task.id === draggedTask.id 
                                ? { ...task, status_id: statusId }
                                : task
                        )
                    );
                },
                onError: (errors) => {
                    // В случае ошибки также сбрасываем состояние
                    console.error('Ошибка обновления статуса задачи:', errors);
                },
                onFinish: () => {
                    // Всегда сбрасываем draggedTask в конце
                    setDraggedTask(null);
                }
            });
        } else {
            // Если задача не изменила статус, все равно сбрасываем состояние
            setDraggedTask(null);
        }
    };

    const handleDragEnd = () => {
        // Всегда сбрасываем состояния при окончании перетаскивания
        setDraggedTask(null);
        setDragOverStatusId(null);
    };

    // Фильтрация задач по спринту и исполнителю
    const filteredTasks = localTasks.filter(task => {
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
                {/* Новый заголовок и статус */}
                <div className="mb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Доска задач <span className="text-accent-blue">/ {project.name}</span>
                      </h1>
                      {project.description && (
                        <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>{getStatusText(project.status)}</span>
                      {project.deadline && (
                        <span className="text-xs text-gray-400 ml-2">Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Компактный фильтр и кнопки */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-2">
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 justify-between">
                    {/* Спринты */}
                    <select
                      value={selectedSprintId}
                      onChange={e => setSelectedSprintId(e.target.value)}
                      className="form-select min-w-[140px] max-w-[180px]"
                    >
                      <option value="all">Все спринты</option>
                      {sprints.map(sprint => (
                        <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                      ))}
                    </select>
                    {/* Исполнитель */}
                    <select
                      value={assigneeId}
                      onChange={e => setAssigneeId(e.target.value)}
                      className="form-select min-w-[140px] max-w-[180px]"
                    >
                      <option value="">Все исполнители</option>
                      {members.map(user => (
                        <option key={user.id} value={user.id}>{user.name} {user.email ? `(${user.email})` : ''}</option>
                      ))}
                    </select>
                    {/* Мои задачи */}
                    <label className="flex items-center gap-2 text-sm text-white whitespace-nowrap select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={myTasks}
                        onChange={e => setMyTasks(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-accent-blue border-gray-400 focus:ring-2 focus:ring-accent-blue focus:ring-offset-0 rounded transition-all duration-150"
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span className="ml-1">Мои задачи</span>
                    </label>
                    {/* Кнопка создать спринт */}
                    <Link
                      href={route('sprints.create', project.id)}
                      className="btn btn-secondary ml-auto"
                    >
                      + Спринт
                    </Link>
                    {/* Кнопка добавить задачу */}
                    <Link
                      href={route('tasks.create', { project_id: project.id })}
                      className="btn btn-primary"
                    >
                      + Задача
                    </Link>
                  </div>
                </div>

                {/* Kanban доска с ограничением по высоте */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div /> {/* пустой div для выравнивания */}
                    </div>
                    {/* Горизонтальный скролл для колонок, ограничение по высоте */}
                    <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
                         style={{ maxHeight: 'calc(100vh - 260px)', minHeight: '320px' }}>
                        {taskStatuses.map((status) => {
                            const statusTasks = getFilteredStatusTasks(status.id);
                            return (
                                <div
                                    key={status.id}
                                    className={`bg-gray-800 border rounded-lg p-4 flex-shrink-0 w-56 md:w-64 lg:w-72 min-h-[300px] max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 transition-all duration-200 ${
                                        dragOverStatusId === status.id 
                                            ? 'border-accent-blue bg-accent-blue/10 shadow-lg shadow-accent-blue/20' 
                                            : 'border-gray-700'
                                    }`}
                                    onDragOver={(e) => handleDragOver(e, status.id)}
                                    onDragLeave={(e) => handleDragLeave(e, status.id)}
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
                                        {statusTasks.length === 0 && dragOverStatusId === status.id && (
                                            <div className="border-2 border-dashed border-accent-blue/50 rounded-lg p-8 text-center">
                                                <div className="text-accent-blue/70 text-4xl mb-2">📋</div>
                                                <p className="text-accent-blue/70 text-sm font-medium">Отпустите задачу здесь</p>
                                            </div>
                                        )}
                                        {statusTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`bg-gray-700 border rounded-lg p-3 cursor-move hover:bg-gray-600 hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                                                    draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''
                                                }`}
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
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={closeTaskModal}
                >
                    <div 
                        className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
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

                            <TaskForm
                                task={selectedTask}
                                projects={[project]}
                                sprints={sprints}
                                members={members}
                                errors={errors}
                                onSubmit={handleTaskUpdate}
                                onCancel={closeTaskModal}
                                isModal={true}
                                processing={processing}
                            />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
