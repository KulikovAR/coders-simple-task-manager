import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/utils/statusUtils';
import TaskForm from '@/Components/TaskForm';
import PaymentModal from '@/Components/PaymentModal';

export default function Board({ auth, project, tasks, taskStatuses, sprints = [], members = [], selectedSprintId = 'none', hasCustomStatuses = false }) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [currentSprintId, setCurrentSprintId] = useState(selectedSprintId || 'none');
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
    const [successMessage, setSuccessMessage] = useState('');
    // Мобильный лонгтап для смены статуса
    const [isStatusOverlayOpen, setIsStatusOverlayOpen] = useState(false);
    const [statusOverlayTask, setStatusOverlayTask] = useState(null);
    const longPressTimerRef = useRef(null);
    const touchStartPointRef = useRef({ x: 0, y: 0 });
    const longPressTriggeredRef = useRef(false);

    // Обновляем локальные задачи при изменении props
    useEffect(() => {
        // Нормализуем ID для корректного сравнения
        const normalizedTasks = tasks.map(task => ({
            ...task,
            status_id: parseInt(task.status_id),
            sprint_id: task.sprint_id ? parseInt(task.sprint_id) : task.sprint_id,
            assignee_id: task.assignee_id ? parseInt(task.assignee_id) : task.assignee_id,
            project_id: parseInt(task.project_id)
        }));
        setLocalTasks(normalizedTasks);
    }, [tasks]);

    // Автоматически скрываем сообщение об успехе через 4 секунды
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

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
        // Загружаем задачу с комментариями
        fetch(route('tasks.show', task.id) + '?modal=1', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.props && data.props.task) {
                setSelectedTask(data.props.task);
            } else {
                setSelectedTask(task);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки задачи:', error);
            setSelectedTask(task);
        });
        
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

    const handleTaskUpdate = async (data) => {
        setProcessing(true);
        setErrors({});

        try {
            // Подготавливаем данные для отправки
            const formData = new FormData();
            
            // Добавляем все поля из data
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            
            // Добавляем метод для Laravel
            formData.append('_method', 'PUT');

            // Получаем CSRF токен
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(route('tasks.update', selectedTask.id), {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Обновляем задачу в локальном состоянии с данными, полученными от сервера
                setLocalTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === selectedTask.id
                            ? {
                                ...task,
                                ...result.task,
                                // Убеждаемся, что связанные объекты правильно обновляются
                                assignee: result.task.assignee || task.assignee,
                                status: result.task.status || task.status,
                                sprint: result.task.sprint || task.sprint,
                                project: result.task.project || task.project,
                                // Обновляем поля статуса для совместимости, приводим к числу для единообразия
                                status_id: parseInt(result.task.status_id || result.task.status?.id || task.status_id),
                                sprint_id: result.task.sprint_id ? parseInt(result.task.sprint_id) : (result.task.sprint?.id ? parseInt(result.task.sprint.id) : task.sprint_id),
                                assignee_id: result.task.assignee_id ? parseInt(result.task.assignee_id) : (result.task.assignee?.id ? parseInt(result.task.assignee.id) : task.assignee_id),
                                project_id: parseInt(result.task.project_id || result.task.project?.id || task.project_id)
                            }
                            : task
                    )
                );
                
                // Обновляем выбранную задачу для отображения в модалке
                setSelectedTask(prev => ({
                    ...prev,
                    ...result.task,
                    assignee: result.task.assignee || prev.assignee,
                    status: result.task.status || prev.status,
                    sprint: result.task.sprint || prev.sprint,
                    project: result.task.project || prev.project
                }));
                
                closeTaskModal();
                
                // Показываем сообщение об успехе
                setSuccessMessage(result.message || 'Задача успешно обновлена');
            } else {
                // Обрабатываем ошибки валидации
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    setErrors({ general: result.message || 'Произошла ошибка при обновлении задачи' });
                }
            }
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            setErrors({ general: 'Произошла ошибка при обновлении задачи' });
        } finally {
            setProcessing(false);
        }
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

    // Цвета статусов из данных (динамические)
    const getStatusIndicatorColor = (statusId) => {
        const status = taskStatuses.find(s => s.id === statusId);
        return status?.color || '#6B7280';
    };

    const getStatusIndicatorBgClass = (statusId) => {
        // Конвертируем hex цвет в CSS класс background
        const color = getStatusIndicatorColor(statusId);
        return 'bg-[' + color + ']';
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, statusId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Если перетаскиваем в том же статусе, показываем зоны приоритетов
        if (draggedTask && parseInt(draggedTask.status_id) === parseInt(statusId)) {
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

        if (draggedTask && parseInt(draggedTask.status_id) !== parseInt(statusId)) {
            router.put(route('tasks.status.update', draggedTask.id), {
                status_id: statusId
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Обновляем задачу в локальном состоянии
                    setLocalTasks(prevTasks =>
                        prevTasks.map(task =>
                            task.id === draggedTask.id
                                ? { ...task, status_id: parseInt(statusId) }
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
                setLocalTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status_id: parseInt(statusId) } : t));
                closeStatusOverlay();
            },
            onError: () => {
                closeStatusOverlay();
            }
        });
    };

    // Фильтрация задач по спринту и исполнителю
    const filteredTasks = localTasks.filter(task => {
        let sprintOk = false;
        if (currentSprintId === 'none') {
            sprintOk = !task.sprint_id; // Показать только задачи без спринта
        } else {
            sprintOk = parseInt(task.sprint_id) === parseInt(currentSprintId); // Показать задачи конкретного спринта
        }
        
        const assigneeOk = assigneeId ? parseInt(task.assignee_id) === parseInt(assigneeId) : true;
        const myOk = myTasks ? parseInt(task.assignee_id) === parseInt(auth.user.id) : true;
        return sprintOk && assigneeOk && myOk;
    });

    // Функция для получения порядка приоритетов
    const getPriorityOrder = (priority) => {
        const order = { 'high': 1, 'medium': 2, 'low': 3 };
        return order[priority] || 4; // Задачи без приоритета идут последними
    };

    // Динамическая проверка кастомных статусов
    const currentSprintHasCustomStatuses = currentSprintId !== 'none' && taskStatuses.some(status => parseInt(status.sprint_id) === parseInt(currentSprintId));
    const getFilteredStatusTasks = (statusId) => {
        // Приводим statusId к числу для корректного сравнения
        const normalizedStatusId = parseInt(statusId);
        const tasks = filteredTasks.filter(task => task.status_id === normalizedStatusId);
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
                {/* Сообщение об успехе */}
                {successMessage && (
                    <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg text-accent-green animate-fade-in">
                        <div className="flex items-start gap-3 p-4">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <h4 className="font-medium mb-1">Успешно!</h4>
                                <p className="text-sm">{successMessage}</p>
                            </div>
                            <button
                                onClick={() => setSuccessMessage('')}
                                className="text-accent-green/60 hover:text-accent-green transition-colors p-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

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

                {/* Улучшенные фильтры и кнопки */}
                <div className="card">
                  <div className="space-y-4">
                    {/* Первая строка: основные фильтры */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Спринты */}
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Спринт</label>
                        <select
                          value={currentSprintId}
                          onChange={e => {
                            const newSprintId = e.target.value;
                            setCurrentSprintId(newSprintId);
                            const url = newSprintId === 'none'
                              ? route('projects.board', project.id)
                              : route('projects.board', project.id) + '?sprint_id=' + newSprintId;
                            router.visit(url, { preserveState: false });
                          }}
                          className="form-select w-full"
                        >
                          <option value="none">Без спринта</option>
                          {sprints.map(sprint => (
                            <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Исполнитель */}
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Исполнитель</label>
                        <select
                          value={assigneeId}
                          onChange={e => setAssigneeId(e.target.value)}
                          className="form-select w-full"
                        >
                          <option value="">Все исполнители</option>
                          {members.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Мои задачи */}
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm text-text-primary select-none cursor-pointer touch-target">
                          <input
                            type="checkbox"
                            checked={myTasks}
                            onChange={e => setMyTasks(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-accent-blue border-border-color focus:ring-2 focus:ring-accent-blue rounded-lg transition-all duration-200"
                          />
                          <span>Мои задачи</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Вторая строка: кнопки действий */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border-color">
                      <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <Link
                          href={route('sprints.create', project.id)}
                          className="btn btn-secondary btn-mobile-stack order-3 sm:order-1"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Создать спринт
                        </Link>
                        <button
                          onClick={() => {
                            const isPaid = auth.user?.paid && (!auth.user?.expires_at || new Date(auth.user.expires_at) > new Date());
                            if (!isPaid) {
                              openPaymentModal();
                            } else {
                              router.visit(route('ai-agent.index'));
                            }
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm text-white btn-mobile-stack order-2 sm:order-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="hidden sm:inline">Задача с ИИ</span>
                          <span className="sm:hidden">ИИ задача</span>
                        </button>
                        <Link
                          href={route('tasks.create', { project_id: project.id })}
                          className="btn btn-primary btn-mobile-stack btn-mobile-priority order-1 sm:order-3"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Новая задача
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Информация о статусах */}
                {currentSprintId !== 'none' && (
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${currentSprintHasCustomStatuses ? 'bg-accent-blue' : 'bg-accent-slate'}`}></div>
                                <span className="text-body-small text-text-secondary">
                                    {currentSprintHasCustomStatuses
                                        ? 'Спринт использует кастомные статусы'
                                        : 'Спринт использует статусы проекта'
                                    }
                                </span>
                            </div>
                            <Link
                                href={route('sprints.statuses', [project.id, currentSprintId])}
                                className="btn btn-secondary btn-sm"
                            >
                                Настроить статусы
                            </Link>
                        </div>
                    </div>
                )}

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
                                            <div
                                                className="w-3 h-3 rounded-full shadow-sm"
                                                style={{ backgroundColor: getStatusIndicatorColor(status.id) }}
                                            ></div>
                                            <h4 className="text-text-primary font-semibold">{status.name}</h4>
                                        </div>
                                        <span className="bg-card-bg text-text-primary text-caption px-2.5 py-1 rounded-full font-medium shadow-sm">
                                            {statusTasks.length}
                                        </span>
                                    </div>

                                    {/* Фиксированные зоны приоритетов при перетаскивании в том же статусе */}
                                    {showPriorityDropZones && parseInt(dragOverStatusId) === parseInt(status.id) && parseInt(draggedTask?.status_id) === parseInt(status.id) && (
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
                                                        <a
                                                            href={route('tasks.show', task.id)}
                                                            className="hover:text-accent-blue transition-colors duration-200"
                                                            onClick={(e) => e.stopPropagation()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {task.title}
                                                        </a>
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
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={closeTaskModal}
                    />
                    
                    {/* Modal container - полноэкранная на мобильных */}
                    <div className="relative z-10 flex min-h-full lg:items-center lg:justify-center lg:p-4">
                        <div 
                            className="w-full h-full lg:h-auto lg:max-h-[90vh] lg:rounded-2xl lg:max-w-6xl bg-card-bg/50 border border-slate-200 dark:border-border-color shadow-2xl transform transition-all duration-300 ease-out overflow-hidden backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Заголовок модалки с градиентом и кнопками */}
                            <div className="bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 dark:border-border-color border-b border-slate-200 backdrop-blur-md p-4 lg:p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        {/* Адаптивная версия заголовка */}
                                        <div className="flex items-center gap-3 mb-2">
                                            {selectedTask.code && (
                                                <span className="px-2 lg:px-3 py-1 bg-white/90 dark:bg-transparent rounded-full text-slate-800 dark:text-white font-mono text-xs lg:text-sm border border-slate-300 dark:border-white shadow-sm">
                                                    {selectedTask.code}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2">
                                                {selectedTask.priority && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)} shadow-sm`}>
                                                        {selectedTask.priority}
                                                    </span>
                                                )}
                                                {selectedTask.status && (
                                                    <span className="px-2 py-1 bg-white/90 dark:bg-transparent rounded-full text-slate-800 dark:text-white text-xs font-medium border border-slate-300 dark:border-white shadow-sm">
                                                        {selectedTask.status.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h2 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-text-primary mb-1 line-clamp-2 drop-shadow-sm">
                                            {selectedTask.title}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-slate-700 dark:text-text-secondary text-xs lg:text-sm">
                                            {selectedTask.assignee && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 lg:w-6 lg:h-6 bg-white/90 dark:bg-transparent rounded-full flex items-center justify-center border border-slate-300 dark:border-white shadow-sm">
                                                        <span className="text-xs font-medium text-slate-800 dark:text-white">
                                                            {selectedTask.assignee.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <span className="truncate max-w-[120px] lg:max-w-none drop-shadow-sm">{selectedTask.assignee.name}</span>
                                                </div>
                                            )}
                                            {selectedTask.deadline && (
                                                <div className="flex items-center gap-1 drop-shadow-sm">
                                                    <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{new Date(selectedTask.deadline).toLocaleDateString('ru-RU')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Кнопки действий в шапке */}
                                    <div className="flex items-center gap-3 ml-4">
                                        <button
                                            type="button"
                                            onClick={closeTaskModal}
                                            className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-white/90 dark:hover:bg-secondary-bg/80 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border border-slate-300 dark:border-border-color shadow-sm backdrop-blur-sm"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Вызываем submit формы TaskForm
                                                const form = document.querySelector('#task-form');
                                                if (form) {
                                                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                                    form.dispatchEvent(submitEvent);
                                                }
                                            }}
                                            className="bg-accent-blue hover:bg-accent-blue/80 disabled:bg-accent-blue/50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Сохранение...
                                                </>
                                            ) : (
                                                'Обновить задачу'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Содержимое модалки с корректной высотой */}
                            <div className="overflow-y-auto scrollbar-thin h-[calc(100vh-140px)] lg:max-h-[calc(90vh-140px)]">
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
                                    auth={auth}
                                />
                            </div>
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
                                    className={`border rounded-xl p-3 text-left transition-all ${parseInt(statusOverlayTask.status_id) === parseInt(status.id) ? 'border-accent-blue bg-accent-blue/10' : 'border-border-color hover:border-accent-blue/50 hover:bg-secondary-bg'}`}
                                    onClick={() => handleStatusSelect(status.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: getStatusIndicatorColor(status.id) }}
                                        ></div>
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
