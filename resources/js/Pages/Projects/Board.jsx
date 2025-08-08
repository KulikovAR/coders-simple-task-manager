import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/utils/statusUtils';
import TaskForm from '@/Components/TaskForm';
import PaymentModal from '@/Components/PaymentModal';

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
    const [showPriorityDropZones, setShowPriorityDropZones] = useState(false);
    const [dragOverPriority, setDragOverPriority] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    // Мобильный лонгтап для смены статуса
    const [isStatusOverlayOpen, setIsStatusOverlayOpen] = useState(false);
    const [statusOverlayTask, setStatusOverlayTask] = useState(null);
    const longPressTimerRef = useRef(null);
    const touchStartPointRef = useRef({ x: 0, y: 0 });
    const longPressTriggeredRef = useRef(false);

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

    const openPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
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
                return 'bg-accent-green text-white';
            case 'completed':
                return 'bg-accent-blue text-white';
            case 'on_hold':
                return 'bg-accent-yellow text-white';
            case 'cancelled':
                return 'bg-accent-red text-white';
            default:
                return 'bg-accent-slate text-white';
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

    // Улучшенные цвета приоритетов с цветными фонами
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'bg-accent-green/20 text-accent-green border-accent-green/30';
            case 'medium':
                return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30';
            case 'high':
                return 'bg-accent-red/20 text-accent-red border-accent-red/30';
            default:
                return 'bg-accent-slate/20 text-accent-slate border-accent-slate/30';
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
                return '🌱';
            case 'medium':
                return '⚡';
            case 'high':
                return '🔥';
            default:
                return '•';
        }
    };

    // Цвета статусов для индикаторов
    const getStatusIndicatorColor = (statusName) => {
        switch (statusName) {
            case 'To Do':
                return 'bg-accent-slate';
            case 'In Progress':
                return 'bg-accent-blue';
            case 'Review':
                return 'bg-accent-yellow';
            case 'Testing':
                return 'bg-accent-purple';
            case 'Ready for Release':
                return 'bg-accent-pink';
            case 'Done':
                return 'bg-accent-green';
            default:
                return 'bg-accent-slate';
        }
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, statusId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Если перетаскиваем в том же статусе, показываем зоны приоритетов
        if (draggedTask && draggedTask.status_id === statusId) {
            setShowPriorityDropZones(true);
            setDragOverStatusId(statusId);
        } else {
            setShowPriorityDropZones(false);
            setDragOverStatusId(statusId);
        }
    };

    const handleDragLeave = (e, statusId) => {
        e.preventDefault();
        // Проверяем, что мы действительно покидаем область, а не переходим к дочернему элементу
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverStatusId(null);
            setShowPriorityDropZones(false);
        }
    };

    const handlePriorityDragOver = (e, priority) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverPriority(priority);
    };

    const handlePriorityDragLeave = (e) => {
        e.preventDefault();
        setDragOverPriority(null);
    };

    const handlePriorityDrop = (e, priority) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverPriority(null);
        setShowPriorityDropZones(false);

        if (draggedTask && draggedTask.priority !== priority) {
            router.put(route('tasks.priority.update', draggedTask.id), {
                priority: priority
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Обновляем задачу в локальном состоянии
                    setLocalTasks(prevTasks =>
                        prevTasks.map(task =>
                            task.id === draggedTask.id
                                ? { ...task, priority: priority }
                                : task
                        )
                    );
                },
                onError: (errors) => {
                    console.error('Ошибка обновления приоритета задачи:', errors);
                },
                onFinish: () => {
                    setDraggedTask(null);
                }
            });
        } else {
            setDraggedTask(null);
        }
    };

    const handleDrop = (e, statusId) => {
        e.preventDefault();
        setDragOverStatusId(null);
        setShowPriorityDropZones(false);

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
        setShowPriorityDropZones(false);
        setDragOverPriority(null);
    };

    // Лонгтап на мобильных для смены статуса
    const cancelLongPressTimer = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const openStatusOverlay = (task) => {
        setStatusOverlayTask(task);
        setIsStatusOverlayOpen(true);
    };

    const closeStatusOverlay = () => {
        setIsStatusOverlayOpen(false);
        setStatusOverlayTask(null);
    };

    const handleTaskTouchStart = (e, task) => {
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        touchStartPointRef.current = { x: touch.clientX, y: touch.clientY };
        longPressTriggeredRef.current = false;
        cancelLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
            longPressTriggeredRef.current = true;
            openStatusOverlay(task);
        }, 500);
    };

    const handleTaskTouchMove = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPointRef.current.x;
        const dy = touch.clientY - touchStartPointRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 12) {
            cancelLongPressTimer();
        }
    };

    const handleTaskTouchEnd = (e) => {
        if (longPressTriggeredRef.current) {
            e.preventDefault();
        }
        cancelLongPressTimer();
        longPressTriggeredRef.current = false;
    };

    const handleStatusSelect = (statusId) => {
        if (!statusOverlayTask) return;
        const taskId = statusOverlayTask.id;
        router.put(route('tasks.status.update', taskId), {
            status_id: statusId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setLocalTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status_id: statusId } : t));
                closeStatusOverlay();
            },
            onError: () => {
                closeStatusOverlay();
            }
        });
    };

    // Фильтрация задач по спринту и исполнителю
    const filteredTasks = localTasks.filter(task => {
        const sprintOk = selectedSprintId === 'all' || task.sprint_id == selectedSprintId;
        const assigneeOk = assigneeId ? String(task.assignee_id) === String(assigneeId) : true;
        const myOk = myTasks ? String(task.assignee_id) === String(auth.user.id) : true;
        return sprintOk && assigneeOk && myOk;
    });

    // Функция для получения порядка приоритетов
    const getPriorityOrder = (priority) => {
        const order = { 'high': 1, 'medium': 2, 'low': 3 };
        return order[priority] || 4; // Задачи без приоритета идут последними
    };

    const getFilteredStatusTasks = (statusId) => {
        const tasks = filteredTasks.filter(task => task.status_id === statusId);
        // Сортируем по приоритету: высокий -> средний -> низкий -> без приоритета
        return tasks.sort((a, b) => {
            const priorityA = getPriorityOrder(a.priority);
            const priorityB = getPriorityOrder(b.priority);
            return priorityA - priorityB;
        });
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
                      <h1 className="text-heading-2 text-text-primary">
                        Доска задач <span className="text-gradient">/ {project.name}</span>
                      </h1>
                      {project.description && (
                        <p className="text-body-small text-text-secondary mt-2">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                      <span className={`px-3 py-1.5 rounded-full text-caption font-medium shadow-sm ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                      </span>
                      {project.deadline && (
                        <span className="text-caption text-text-muted">Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Компактный фильтр и кнопки */}
                <div className="card">
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
                    <label className="flex items-center gap-2 text-body-small text-text-primary whitespace-nowrap select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={myTasks}
                        onChange={e => setMyTasks(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-accent-blue border-border-color focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-card-bg rounded-lg transition-all duration-200"
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
                    {/* Кнопки создания задач */}
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                // Проверяем, есть ли у пользователя активная подписка
                                const isPaid = auth.user?.paid && (!auth.user?.expires_at || new Date(auth.user.expires_at) > new Date());
                                if (!isPaid) {
                                    openPaymentModal();
                                } else {
                                    router.visit(route('ai-agent.index'));
                                }
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm justify-center min-w-[160px]"
                            style={{ color: 'white' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Задача с ИИ
                        </button>
                        <Link
                            href={route('tasks.create', { project_id: project.id })}
                            className="btn btn-primary justify-center min-w-[120px]"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Задача
                        </Link>
                    </div>
                  </div>
                </div>

                {/* Kanban доска с ограничением по высоте */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <div /> {/* пустой div для выравнивания */}
                    </div>
                    {/* Горизонтальный скролл для колонок, ограничение по высоте */}
                    <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent"
                         style={{ maxHeight: 'calc(100vh - 260px)', minHeight: '320px' }}>
                        {taskStatuses.map((status) => {
                            const statusTasks = getFilteredStatusTasks(status.id);
                            return (
                                <div
                                    key={status.id}
                                    className={`bg-secondary-bg border rounded-xl p-4 flex-shrink-0 w-56 md:w-64 lg:w-72 min-h-[300px] max-h-full flex flex-col transition-all duration-300 ${
                                        dragOverStatusId === status.id
                                            ? 'border-accent-blue bg-accent-blue/5 shadow-glow-blue'
                                            : 'border-border-color'
                                    }`}
                                    onDragOver={(e) => handleDragOver(e, status.id)}
                                    onDragLeave={(e) => handleDragLeave(e, status.id)}
                                    onDrop={(e) => handleDrop(e, status.id)}
                                >
                                    {/* Заголовок колонки с индикатором */}
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-color">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${getStatusIndicatorColor(status.name)} shadow-sm`}></div>
                                            <h4 className="text-text-primary font-semibold">{status.name}</h4>
                                        </div>
                                        <span className="bg-card-bg text-text-primary text-caption px-2.5 py-1 rounded-full font-medium shadow-sm">
                                            {statusTasks.length}
                                        </span>
                                    </div>

                                    {/* Фиксированные зоны приоритетов при перетаскивании в том же статусе */}
                                    {showPriorityDropZones && dragOverStatusId === status.id && draggedTask?.status_id === status.id && (
                                        <div className="space-y-3 mb-4 flex-shrink-0">
                                            <div className="text-caption text-text-muted font-medium mb-3 text-center">Выберите приоритет:</div>
                                            {[
                                                {
                                                    priority: 'high',
                                                    label: 'Высокий',
                                                    bgColor: 'bg-accent-red/10',
                                                    borderColor: 'border-accent-red/50',
                                                    hoverBg: 'hover:bg-accent-red/20',
                                                    activeBg: 'bg-accent-red/20',
                                                    textColor: 'text-accent-red',
                                                    shadowColor: 'shadow-glow-red'
                                                },
                                                {
                                                    priority: 'medium',
                                                    label: 'Средний',
                                                    bgColor: 'bg-accent-yellow/10',
                                                    borderColor: 'border-accent-yellow/50',
                                                    hoverBg: 'hover:bg-accent-yellow/20',
                                                    activeBg: 'bg-accent-yellow/20',
                                                    textColor: 'text-accent-yellow',
                                                    shadowColor: 'shadow-glow-yellow'
                                                },
                                                {
                                                    priority: 'low',
                                                    label: 'Низкий',
                                                    bgColor: 'bg-accent-green/10',
                                                    borderColor: 'border-accent-green/50',
                                                    hoverBg: 'hover:bg-accent-green/20',
                                                    activeBg: 'bg-accent-green/20',
                                                    textColor: 'text-accent-green',
                                                    shadowColor: 'shadow-glow-green'
                                                }
                                            ].map(({ priority, label, bgColor, borderColor, hoverBg, activeBg, textColor, shadowColor }) => (
                                                <div
                                                    key={priority}
                                                    className={`priority-zone border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ${
                                                        dragOverPriority === priority
                                                            ? `${activeBg} ${borderColor.replace('/50', '')} ${shadowColor} active`
                                                            : `${bgColor} ${borderColor} ${hoverBg}`
                                                    }`}
                                                    onDragOver={(e) => handlePriorityDragOver(e, priority)}
                                                    onDragLeave={handlePriorityDragLeave}
                                                    onDrop={(e) => handlePriorityDrop(e, priority)}
                                                >
                                                    <div className={`text-xl font-bold mb-2 ${textColor}`}>
                                                        {priority === 'high' ? '🔥' : priority === 'medium' ? '⚡' : '🌱'}
                                                    </div>
                                                    <div className={`text-body-small font-semibold ${textColor}`}>{label}</div>
                                                    <div className="text-caption text-text-muted mt-1">приоритет</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Скроллируемая область с задачами */}
                                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent space-y-3">
                                        {statusTasks.length === 0 && dragOverStatusId === status.id && !showPriorityDropZones && (
                                            <div className="border-2 border-dashed border-accent-blue/30 rounded-xl p-8 text-center bg-accent-blue/5">
                                                <div className="text-accent-blue/50 text-4xl mb-3">📋</div>
                                                <p className="text-accent-blue/50 text-body-small font-medium">Отпустите задачу здесь</p>
                                            </div>
                                        )}
                                        {statusTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`task-card bg-card-bg border rounded-xl p-4 cursor-move hover:bg-secondary-bg hover:border-accent-blue/30 shadow-sm hover:shadow-md transition-all duration-300 ${
                                                    draggedTask?.id === task.id ? 'dragging' : ''
                                                }`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => openTaskModal(task)}
                                                onTouchStart={(e) => handleTaskTouchStart(e, task)}
                                                onTouchMove={handleTaskTouchMove}
                                                onTouchEnd={handleTaskTouchEnd}
                                            >
                                                {/* Код задачи */}
                                                {task.code && (
                                                    <div className="text-caption font-mono text-accent-blue mb-3 font-bold flex items-center">
                                                        <span className="mr-2">🔗</span>
                                                        {task.code}
                                                    </div>
                                                )}

                                                {/* Заголовок задачи */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <h5 className="text-text-primary font-semibold text-body-small leading-tight">
                                                        <Link
                                                            href={route('tasks.show', task.id)}
                                                            className="hover:text-accent-blue transition-colors duration-200"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {task.title}
                                                        </Link>
                                                    </h5>
                                                </div>

                                                {/* Описание */}
                                                {task.description && (
                                                    <p className="text-text-secondary text-caption mb-4 line-clamp-2 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}

                                                {/* Мета-информация */}
                                                <div className="space-y-3">
                                                    {/* Приоритет с цветным фоном */}
                                                    {task.priority && (
                                                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-caption font-medium shadow-sm ${
                                                            task.priority === 'high'
                                                                ? 'bg-accent-red/20 text-accent-red border border-accent-red/30'
                                                                : task.priority === 'medium'
                                                                    ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                                                                    : 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                                                        }`}>
                                                            <span className="text-sm">
                                                                {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                                                            </span>
                                                            <span>{getPriorityText(task.priority)}</span>
                                                        </div>
                                                    )}

                                                    {/* Исполнитель */}
                                                    {task.assignee && (
                                                        <div className="flex items-center space-x-2 text-caption text-text-secondary">
                                                            <div className="w-5 h-5 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                                                                <span className="text-caption font-semibold text-accent-blue">
                                                                    {task.assignee.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span>{task.assignee.name}</span>
                                                        </div>
                                                    )}

                                                    {/* Дедлайн с предупреждением */}
                                                    {task.deadline && (
                                                        <div className="flex items-center space-x-2 text-caption">
                                                            <span className="text-text-secondary">📅</span>
                                                            <span className={`${
                                                                new Date(task.deadline) < new Date()
                                                                    ? 'text-accent-red font-medium'
                                                                    : 'text-text-secondary'
                                                            }`}>
                                                                {new Date(task.deadline).toLocaleDateString('ru-RU')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Информация о спринте */}
                                                {task.sprint && (
                                                    <div className="mt-4 pt-3 border-t border-border-color">
                                                        <div className="flex items-center justify-between text-caption">
                                                            <span className="text-text-secondary flex items-center">
                                                                <span className="mr-2">🏃</span>
                                                                Спринт:
                                                            </span>
                                                            <Link
                                                                href={route('sprints.show', [project.id, task.sprint.id])}
                                                                className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-200"
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={closeTaskModal}
                >
                    <div
                        className="bg-card-bg border border-border-color rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-heading-3 text-text-primary mb-2">Редактирование задачи</h2>
                                    {selectedTask.code && (
                                        <div className="text-body-small font-mono text-accent-blue">{selectedTask.code}</div>
                                    )}
                                </div>
                                <button
                                    onClick={closeTaskModal}
                                    className="text-text-muted hover:text-text-primary text-2xl font-bold transition-colors duration-200"
                                >
                                    ×
                                </button>
                            </div>

                            <TaskForm
                                task={selectedTask}
                                projects={[project]}
                                sprints={sprints}
                                taskStatuses={taskStatuses}
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

            {/* Модалка оплаты подписки */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={closePaymentModal}
            />

            {/* Мобильный оверлей выбора статуса при лонгтапе */}
            {isStatusOverlayOpen && statusOverlayTask && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none" onClick={closeStatusOverlay}>
                    <div className="w-full max-w-lg bg-card-bg border border-border-color rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 select-none" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-text-primary font-semibold">Переместить задачу</h3>
                            <button className="text-text-muted hover:text-text-primary" onClick={closeStatusOverlay}>×</button>
                        </div>
                        <div className="text-sm text-text-secondary mb-4">{statusOverlayTask.title}</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {taskStatuses.map((status) => (
                                <button
                                    key={status.id}
                                    className={`border rounded-xl p-3 text-left transition-all ${statusOverlayTask.status_id === status.id ? 'border-accent-blue bg-accent-blue/10' : 'border-border-color hover:border-accent-blue/50 hover:bg-secondary-bg'}`}
                                    onClick={() => handleStatusSelect(status.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusIndicatorColor(status.name)}`}></div>
                                        <div className="text-sm text-text-primary font-medium">{status.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
