import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import PaymentModal from '@/Components/PaymentModal';
import BoardFilters from '@/Components/Board/BoardFilters';
import StatusInfo from '@/Components/Board/StatusInfo';
import KanbanBoard from '@/Components/Board/KanbanBoard';
import TaskModal from '@/Components/Board/TaskModal';
import MobileStatusOverlay from '@/Components/Board/MobileStatusOverlay';

export default function Board({ auth, project, tasks, taskStatuses, sprints = [], members = [], selectedSprintId = 'none', hasCustomStatuses = false }) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [currentSprintId, setCurrentSprintId] = useState(selectedSprintId || 'none');

    // Определяем, выбран ли спринт по умолчанию (активный спринт при первом заходе)
    const isDefaultSprint = selectedSprintId !== 'none' &&
                           sprints.find(s => s.id == selectedSprintId)?.status === 'active' &&
                           !window.location.search.includes('sprint_id');

    // Отладочная информация
    console.log('Board Debug:', {
        selectedSprintId,
        currentSprintId,
        isDefaultSprint,
        searchParams: window.location.search,
        hasSprintIdNone: window.location.search.includes('sprint_id=none')
    });

    // Автоматически перенаправляем на активный спринт при загрузке, если не выбран конкретный спринт
    useEffect(() => {
        if (selectedSprintId !== 'none' && selectedSprintId !== currentSprintId) {
            setCurrentSprintId(selectedSprintId);
        }
    }, [selectedSprintId, currentSprintId]);
    const [assigneeId, setAssigneeId] = useState('');
    const [myTasks, setMyTasks] = useState(false);
    const [tags, setTags] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
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
    // Переключение между видами: 'cards', 'compact-board', 'list'
    const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem('kanban-view-mode');
        return saved || 'cards';
    });
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
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        };
    }, [showTaskModal]);

    // Дополнительная проверка состояния при изменении задач
    useEffect(() => {
        // Если draggedTask больше не существует в задачах, сбрасываем его
        if (draggedTask && !localTasks.find(task => task.id === draggedTask.id)) {
            setDraggedTask(null);
        }
    }, [localTasks, draggedTask]);

    // Очистка таймеров при размонтировании компонента
    useEffect(() => {
        return () => {
            cancelLongPressTimer();
            // Восстанавливаем скролл при размонтировании
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            // Восстанавливаем позицию скролла если была сохранена
            if (window.statusOverlayScrollY !== undefined) {
                window.scrollTo(0, window.statusOverlayScrollY);
                delete window.statusOverlayScrollY;
            }
        };
    }, []);

    const openTaskModal = (task) => {
        // Сохраняем текущую позицию скролла
        const scrollY = window.scrollY;

        if (task.id) {
            // Загружаем существующую задачу с комментариями
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
        } else {
            // Для новой задачи просто устанавливаем начальные данные
            setSelectedTask(task);
        }

        setShowTaskModal(true);
        setErrors({});

        // Блокируем скролл страницы, но сохраняем позицию
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');

        // Восстанавливаем позицию скролла после блокировки
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);
        });
    };

    const closeTaskModal = () => {
        setShowTaskModal(false);
        setSelectedTask(null);
        setErrors({});
        // Разблокируем скролл страницы
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    };

    const openPaymentModal = () => {
        // Сохраняем текущую позицию скролла
        const scrollY = window.scrollY;

        setShowPaymentModal(true);

        // Блокируем скролл страницы, но сохраняем позицию
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');

        // Восстанавливаем позицию скролла после блокировки
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);
        });
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        // Разблокируем скролл страницы
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    };

    const handleTaskSubmit = async (data) => {
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

            // Получаем CSRF токен
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Определяем URL и метод в зависимости от того, создаем или обновляем задачу
            const isUpdate = selectedTask?.id;
            const url = isUpdate ? route('tasks.update', selectedTask.id) : route('tasks.store');

            if (isUpdate) {
                formData.append('_method', 'PUT');
            }

            const response = await fetch(url, {
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
                if (isUpdate) {
                    // Обновляем задачу в локальном состоянии
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
                } else {
                    // Нормализуем ID новой задачи и добавляем её в локальное состояние
                    const normalizedTask = {
                        ...result.task,
                        status_id: parseInt(result.task.status_id),
                        sprint_id: result.task.sprint_id ? parseInt(result.task.sprint_id) : result.task.sprint_id,
                        assignee_id: result.task.assignee_id ? parseInt(result.task.assignee_id) : result.task.assignee_id,
                        project_id: parseInt(result.task.project_id)
                    };
                    setLocalTasks(prevTasks => [...prevTasks, normalizedTask]);
                    // Закрываем модалку после создания
                    closeTaskModal();
                }

                // Показываем сообщение об успехе
                setSuccessMessage(result.message || (isUpdate ? 'Задача успешно обновлена' : 'Задача успешно создана'));
            } else {
                // Обрабатываем ошибки валидации
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    setErrors({ general: result.message || (isUpdate ? 'Произошла ошибка при обновлении задачи' : 'Произошла ошибка при создании задачи') });
                }
            }
        } catch (error) {
            console.error('Ошибка при обработке задачи:', error);
            setErrors({ general: selectedTask?.id ? 'Произошла ошибка при обновлении задачи' : 'Произошла ошибка при создании задачи' });
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
        // Сохраняем текущую позицию скролла
        const scrollY = window.scrollY;

        // Сохраняем позицию для восстановления
        window.statusOverlayScrollY = scrollY;

        setStatusOverlayTask(task);
        setIsStatusOverlayOpen(true);

        // Блокируем скролл страницы без класса modal-open
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
    };

    const closeStatusOverlay = () => {
        setIsStatusOverlayOpen(false);
        setStatusOverlayTask(null);

        // Восстанавливаем скролл и позицию
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // Восстанавливаем позицию скролла
        if (window.statusOverlayScrollY !== undefined) {
            window.scrollTo(0, window.statusOverlayScrollY);
            delete window.statusOverlayScrollY;
        }
    };

    // Функция переключения видов
    const toggleViewMode = () => {
        const modes = ['cards', 'compact-board', 'list'];
        const currentIndex = modes.indexOf(viewMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        const newMode = modes[nextIndex];
        setViewMode(newMode);
        localStorage.setItem('kanban-view-mode', newMode);
    };

    const handleTaskTouchStart = (e, task) => {
        if (!e.touches || e.touches.length === 0) return;

        const touch = e.touches[0];
        touchStartPointRef.current = { x: touch.clientX, y: touch.clientY };
        longPressTriggeredRef.current = false;
        cancelLongPressTimer();

        // Оптимальное время 500мс для лонгтапа
        longPressTimerRef.current = setTimeout(() => {
            longPressTriggeredRef.current = true;

            // Добавляем вибрацию для тактильной обратной связи (если поддерживается)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            openStatusOverlay(task);
        }, 500);
    };

    const handleTaskTouchMove = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPointRef.current.x;
        const dy = touch.clientY - touchStartPointRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Уменьшаем порог движения для более надежного отслеживания
        if (distance > 8) {
            cancelLongPressTimer();
        }
    };

    const handleTaskTouchEnd = (e) => {
        cancelLongPressTimer();

        if (longPressTriggeredRef.current) {
            e.preventDefault();
            e.stopPropagation(); // Предотвращаем всплытие события и клик

            // Сбрасываем флаг с задержкой, чтобы предотвратить случайный клик
            setTimeout(() => {
                longPressTriggeredRef.current = false;
            }, 100);
            return; // Важно: выходим из функции, чтобы не сбросить флаг преждевременно
        }

        longPressTriggeredRef.current = false;
    };

    const handleStatusSelect = (statusId) => {
        if (!statusOverlayTask) return;
        const taskId = statusOverlayTask.id;

        // Сохраняем позицию скролла перед запросом
        const savedScrollY = window.statusOverlayScrollY;

        router.put(route('tasks.status.update', taskId), {
            status_id: statusId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setLocalTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status_id: parseInt(statusId) } : t));
                closeStatusOverlay();

                // Дополнительно восстанавливаем позицию после обновления
                if (savedScrollY !== undefined) {
                    setTimeout(() => window.scrollTo(0, savedScrollY), 50);
                }
            },
            onError: () => {
                closeStatusOverlay();

                // Восстанавливаем позицию даже при ошибке
                if (savedScrollY !== undefined) {
                    setTimeout(() => window.scrollTo(0, savedScrollY), 50);
                }
            }
        });
    };

    // Фильтрация задач по спринту, исполнителю, тегам и поисковому запросу
    const filteredTasks = localTasks.filter(task => {
        let sprintOk = false;
        if (currentSprintId === 'none') {
            sprintOk = !task.sprint_id; // Показать только задачи без спринта
        } else {
            sprintOk = parseInt(task.sprint_id) === parseInt(currentSprintId); // Показать задачи конкретного спринта
        }

        const assigneeOk = assigneeId ? parseInt(task.assignee_id) === parseInt(assigneeId) : true;
        const myOk = myTasks ? parseInt(task.assignee_id) === parseInt(auth.user.id) : true;

        // Фильтрация по тегам
        let tagsOk = true;
        if (tags) {
            const searchTags = tags.toLowerCase().split(' ').filter(tag => tag);
            tagsOk = searchTags.every(searchTag =>
                task.tags && task.tags.some(taskTag =>
                    taskTag.toLowerCase().includes(searchTag)
                )
            );
        }

        // Фильтрация по поисковому запросу (названию задачи)
        let searchOk = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            searchOk = task.name && task.name.toLowerCase().includes(query);
        }

        return sprintOk && assigneeOk && myOk && tagsOk && searchOk;
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
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-heading-2 text-text-primary break-words">
                        Доска задач <span className="text-gradient">/ {project.name}</span>
                      </h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 md:mt-0 md:flex-shrink-0">
                      <span className={`px-3 py-1.5 rounded-full text-caption font-medium shadow-sm ${getStatusColor(project.status)} text-center`}>
                          {getStatusText(project.status)}
                      </span>
                                                            {project.deadline && project.deadline !== '0000-00-00' && (
                                        <span className="text-caption text-text-muted text-center sm:text-left">
                                          Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}
                                        </span>
                                      )}
                    </div>
                  </div>
                </div>

                {/* Фильтры и кнопки действий */}
                <BoardFilters
                    project={project}
                    sprints={sprints}
                    members={members}
                    currentSprintId={currentSprintId}
                    setCurrentSprintId={setCurrentSprintId}
                    selectedSprintId={selectedSprintId}
                    isDefaultSprint={isDefaultSprint}
                    assigneeId={assigneeId}
                    setAssigneeId={setAssigneeId}
                    myTasks={myTasks}
                    setMyTasks={setMyTasks}
                    tags={tags}
                    setTags={setTags}
                    auth={auth}
                    openPaymentModal={openPaymentModal}
                    viewMode={viewMode}
                    toggleViewMode={toggleViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Информация о статусах */}
                <StatusInfo
                    project={project}
                    sprints={sprints}
                    currentSprintId={currentSprintId}
                    currentSprintHasCustomStatuses={currentSprintHasCustomStatuses}
                    isDefaultSprint={isDefaultSprint}
                />

                {/* Kanban доска */}
                <KanbanBoard
                    taskStatuses={taskStatuses}
                    getFilteredStatusTasks={getFilteredStatusTasks}
                    project={project}
                    currentSprintId={currentSprintId}
                    dragOverStatusId={dragOverStatusId}
                    draggedTask={draggedTask}
                    showPriorityDropZones={showPriorityDropZones}
                    dragOverPriority={dragOverPriority}
                    getStatusIndicatorColor={getStatusIndicatorColor}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    handlePriorityDragOver={handlePriorityDragOver}
                    handlePriorityDragLeave={handlePriorityDragLeave}
                    handlePriorityDrop={handlePriorityDrop}
                    openTaskModal={openTaskModal}
                    longPressTriggeredRef={longPressTriggeredRef}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleTaskTouchStart={handleTaskTouchStart}
                    handleTaskTouchMove={handleTaskTouchMove}
                    handleTaskTouchEnd={handleTaskTouchEnd}
                    viewMode={viewMode}
                />



            {/* Модальное окно для просмотра и редактирования задачи */}
            <TaskModal
                showTaskModal={showTaskModal}
                selectedTask={selectedTask}
                processing={processing}
                errors={errors}
                project={project}
                sprints={sprints}
                taskStatuses={taskStatuses}
                members={members}
                auth={auth}
                handleTaskSubmit={handleTaskSubmit}
                closeTaskModal={closeTaskModal}
                setSelectedTask={setSelectedTask}
            />

            {/* Модалка оплаты подписки */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={closePaymentModal}
            />

            {/* Мобильный оверлей выбора статуса при лонгтапе */}
            <MobileStatusOverlay
                isOpen={isStatusOverlayOpen}
                statusOverlayTask={statusOverlayTask}
                taskStatuses={taskStatuses}
                getStatusIndicatorColor={getStatusIndicatorColor}
                handleStatusSelect={handleStatusSelect}
                onClose={closeStatusOverlay}
            />
            </div>
        </AuthenticatedLayout>
    );
}
