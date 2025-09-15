import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Gantt({ auth, project, ganttData, sprintId }) {
    const [tasks, setTasks] = useState(ganttData.tasks || []);
    const [dependencies, setDependencies] = useState(ganttData.dependencies || []);
    const [selectedTask, setSelectedTask] = useState(null);
    const [draggedTask, setDraggedTask] = useState(null);
    const [viewMode, setViewMode] = useState('week'); // week, month
    const [showTaskEditModal, setShowTaskEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isCreatingDependency, setIsCreatingDependency] = useState(false);
    const [dependencyStart, setDependencyStart] = useState(null);
    const [hoveredTask, setHoveredTask] = useState(null);
    const ganttRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Инициализируем даты на основе данных проекта
    const [startDate, setStartDate] = useState(() => {
        if (ganttData.project?.start_date) {
            return parseISO(ganttData.project.start_date);
        }
        // Если нет даты проекта, начинаем с сегодняшнего дня
        return new Date();
    });
    
    const [endDate, setEndDate] = useState(() => {
        if (ganttData.project?.end_date) {
            return parseISO(ganttData.project.end_date);
        }
        // Если нет даты проекта, показываем неделю вперед (7 дней)
        return addDays(new Date(), 6);
    });

    // Обновляем данные при изменении ganttData
    useEffect(() => {
        setTasks(ganttData.tasks || []);
        setDependencies(ganttData.dependencies || []);
        
        // Обновляем даты если они есть в данных проекта
        if (ganttData.project?.start_date) {
            setStartDate(parseISO(ganttData.project.start_date));
        }
        if (ganttData.project?.end_date) {
            setEndDate(parseISO(ganttData.project.end_date));
        }
    }, [ganttData]);



    // Вычисляем даты для отображения (используем локальные даты)
    const projectStartDate = startDate;
    const projectEndDate = endDate;

    // Обработка изменения периода отображения
    const handleViewModeChange = (newViewMode) => {
        setViewMode(newViewMode);
        
        // Автоматически устанавливаем период в зависимости от режима
        const now = new Date();
        let newStartDate = new Date(now);
        let newEndDate = new Date(now);
        
        switch (newViewMode) {
            case 'week':
                // Неделя: показываем 7 дней вперед
                newEndDate = addDays(now, 6);
                break;
            case 'month':
                // Месяц: показываем 30 дней вперед
                newEndDate = addDays(now, 29);
                break;
        }
        
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    // Обработка изменения дат через календарь
    const handleDateRangeChange = (newStartDate, newEndDate) => {
        // Убеждаемся, что даты являются объектами Date
        const start = newStartDate instanceof Date ? newStartDate : parseISO(newStartDate);
        const end = newEndDate instanceof Date ? newEndDate : parseISO(newEndDate);
        
        setStartDate(start);
        setEndDate(end);
    };

    // Обработка редактирования задачи
    const handleTaskEdit = (task) => {
        setEditingTask(task);
        setShowTaskEditModal(true);
    };

    // Обработка сохранения изменений задачи
    const handleTaskSave = async (taskId, updates) => {
        const success = await handleTaskUpdate(taskId, updates);
        if (success) {
            setShowTaskEditModal(false);
            setEditingTask(null);
            // Обновляем данные в состоянии с пересчетом end_date
            setTasks(prevTasks => prevTasks.map(task => {
                if (task.id === taskId) {
                    const updatedTask = { ...task, ...updates };
                    // Пересчитываем end_date если изменились start_date или duration_days
                    if (updates.start_date || updates.duration_days) {
                        if (updatedTask.start_date && updatedTask.duration_days) {
                            const taskStart = parseISO(updatedTask.start_date);
                            updatedTask.end_date = format(addDays(taskStart, updatedTask.duration_days - 1), 'yyyy-MM-dd');
                        }
                    }
                    return updatedTask;
                }
                return task;
            }));
        }
        return success;
    };

    // Генерируем временную шкалу на основе локальных дат
    const generateTimeline = () => {
        const timeline = [];
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            timeline.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return timeline;
    };

    const timeline = generateTimeline();

    // Фильтруем задачи по выбранному периоду
    const filteredTasks = tasks.filter(task => {
        if (!task.start_date) return false;
        
        const taskStart = parseISO(task.start_date);
        const taskEnd = task.end_date ? parseISO(task.end_date) : addDays(taskStart, (task.duration_days || 1) - 1);
        
        // Задача попадает в период, если:
        // 1. Начинается в периоде, или
        // 2. Заканчивается в периоде, или  
        // 3. Пересекается с периодом
        return (taskStart >= startDate && taskStart <= endDate) ||
               (taskEnd >= startDate && taskEnd <= endDate) ||
               (taskStart <= startDate && taskEnd >= endDate);
    });

    // Вычисляем позицию задачи на временной шкале
    const getTaskPosition = (task) => {
        if (!task.start_date) return { left: 0, width: 0 };
        
        const taskStart = parseISO(task.start_date);
        const taskEnd = task.end_date ? parseISO(task.end_date) : addDays(taskStart, (task.duration_days || 1) - 1);
        
        const daysFromStart = differenceInDays(taskStart, startDate);
        const taskDuration = differenceInDays(taskEnd, taskStart) + 1;
        
        const left = (daysFromStart / timeline.length) * 100;
        const width = (taskDuration / timeline.length) * 100;
        
        return { left: Math.max(0, left), width: Math.max(1, width) };
    };


    // Обработка обновления задачи
    const handleTaskUpdate = async (taskId, updates) => {
        try {
            const response = await fetch(route('tasks.gantt.update', taskId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const result = await response.json();
                setTasks(prevTasks => prevTasks.map(task => 
                    task.id === taskId ? { ...task, ...result.task } : task
                ));
                
                // Обновляем зависимости если они изменились
                if (result.dependencies) {
                    setDependencies(result.dependencies);
                }
                
                return true;
            } else {
                const error = await response.json();
                console.error('Ошибка обновления задачи:', error);
                alert('Ошибка при обновлении задачи: ' + (error.message || 'Неизвестная ошибка'));
                return false;
            }
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
            alert('Ошибка при обновлении задачи: ' + error.message);
            return false;
        }
    };

    // Обработка создания зависимости
    const handleCreateDependency = async (fromTaskId, toTaskId, type = 'finish_to_start') => {
        try {
            const response = await fetch(route('gantt.dependencies.create'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    task_id: toTaskId,
                    depends_on_task_id: fromTaskId,
                    type: type,
                    lag_days: 0,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setDependencies(prevDeps => [...prevDeps, result.dependency]);
                return true;
            } else {
                const error = await response.json();
                console.error('Ошибка создания зависимости:', error);
                alert('Ошибка при создании зависимости: ' + (error.message || 'Неизвестная ошибка'));
                return false;
            }
        } catch (error) {
            console.error('Ошибка создания зависимости:', error);
            alert('Ошибка при создании зависимости: ' + error.message);
            return false;
        }
    };

    // Обработка начала создания зависимости
    const handleStartDependency = (task) => {
        setIsCreatingDependency(true);
        setDependencyStart(task);
    };

    // Обработка завершения создания зависимости
    const handleEndDependency = async (task) => {
        if (!isCreatingDependency || !dependencyStart) return;
        
        if (dependencyStart.id === task.id) {
            setIsCreatingDependency(false);
            setDependencyStart(null);
            return;
        }

        const success = await handleCreateDependency(
            dependencyStart.id,
            task.id,
            'finish_to_start'
        );

        setIsCreatingDependency(false);
        setDependencyStart(null);
    };

    // Обработка наведения на задачу
    const handleTaskHover = (task) => {
        if (isCreatingDependency) {
            setHoveredTask(task);
        }
    };

    // Обработка ухода с задачи
    const handleTaskLeave = () => {
        setHoveredTask(null);
    };

    // Обработка drag & drop
    const handleTaskDragStart = (e, task) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id.toString());
        setDraggedTask(task);
        setIsDragging(true);
    };

    const handleTaskDragEnd = (e) => {
        setIsDragging(false);
        setDraggedTask(null);
    };

    const handleTimelineDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleTimelineDrop = async (e) => {
        e.preventDefault();
        if (!draggedTask) return;
        
        const rect = ganttRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // Вычитаем ширину левой панели (320px)
        const timelineX = x - 320;
        const timelineWidth = rect.width - 320;
        const percentage = (timelineX / timelineWidth) * 100;
        const daysFromStart = Math.round((percentage / 100) * timeline.length);
        const newStartDate = addDays(startDate, daysFromStart);
        
        const updates = {
            start_date: format(newStartDate, 'yyyy-MM-dd'),
        };
        
        const success = await handleTaskUpdate(draggedTask.id, updates);
        
        if (success) {
            // Обновляем состояние локально с пересчетом end_date
            setTasks(prevTasks => prevTasks.map(task => {
                if (task.id === draggedTask.id) {
                    const updatedTask = { ...task, ...updates };
                    // Пересчитываем end_date если изменилась start_date
                    if (updates.start_date && updatedTask.duration_days) {
                        const taskStart = parseISO(updatedTask.start_date);
                        updatedTask.end_date = format(addDays(taskStart, updatedTask.duration_days - 1), 'yyyy-MM-dd');
                    }
                    return updatedTask;
                }
                return task;
            }));
            console.log('Дата задачи обновлена');
        }
    };

    // Получить цвет задачи по приоритету
    const getTaskColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-text-primary leading-tight">
                        Гантт диаграмма - {project.name}
                    </h2>
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('projects.board', project.id)}
                            className="btn btn-secondary"
                        >
                            ← Канбан доска
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Гантт диаграмма - ${project.name}`} />

            <div className="space-y-6">
                {/* Панель управления */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <select
                                value={viewMode}
                                onChange={(e) => handleViewModeChange(e.target.value)}
                                className="input"
                            >
                                <option value="week">Неделя</option>
                                <option value="month">Месяц</option>
                            </select>
                            
                            <input
                                type="date"
                                value={format(startDate, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    const newStartDate = e.target.value ? parseISO(e.target.value) : startDate;
                                    handleDateRangeChange(newStartDate, endDate);
                                }}
                                className="input"
                            />
                            
                            <span>до</span>
                            
                            <input
                                type="date"
                                value={format(endDate, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    const newEndDate = e.target.value ? parseISO(e.target.value) : endDate;
                                    handleDateRangeChange(startDate, newEndDate);
                                }}
                                className="input"
                            />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    setIsCreatingDependency(!isCreatingDependency);
                                    setDependencyStart(null);
                                }}
                                className={`btn ${isCreatingDependency ? 'btn-primary' : 'btn-secondary'} relative group`}
                                title="Создание зависимостей между задачами. Кликните на первую задачу, затем на вторую для создания связи."
                            >
                                {isCreatingDependency ? '❌ Отменить связь' : '🔗 Связать задачи'}
                                
                                {/* Тултип */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    <div className="font-medium mb-1">Создание зависимостей</div>
                                    <div className="text-gray-300 text-xs">
                                        • Кликните на первую задачу<br/>
                                        • Затем на вторую задачу<br/>
                                        • Создастся связь: первая → вторая<br/>
                                        • Вторая начнется после первой
                                    </div>
                                    {/* Стрелка тултипа */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                </div>
                            </button>
                            
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(route('projects.gantt.calculate-dates', project.id), {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                                            },
                                        });
                                        
                                        if (response.ok) {
                                            const result = await response.json();
                                            alert('Даты задач пересчитаны');
                                            window.location.reload();
                                        } else {
                                            const error = await response.json();
                                            alert('Ошибка при пересчете дат: ' + (error.message || 'Неизвестная ошибка'));
                                        }
                                    } catch (error) {
                                        console.error('Ошибка при пересчете дат:', error);
                                        alert('Ошибка при пересчете дат: ' + error.message);
                                    }
                                }}
                                className="btn btn-primary relative group"
                                title="Автоматически пересчитывает даты начала задач на основе зависимостей. Задача начнется только после окончания всех зависимых задач."
                            >
                                📊 Пересчитать даты
                                
                                {/* Тултип */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    <div className="font-medium mb-1">Автоматический пересчет дат</div>
                                    <div className="text-gray-300 text-xs">
                                        • Анализирует зависимости между задачами<br/>
                                        • Задача начнется после окончания зависимых<br/>
                                        • Учитывает задержки (lag_days)<br/>
                                        • Обновляет расписание проекта
                                    </div>
                                    {/* Стрелка тултипа */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                </div>
                            </button>
                            
                            <div className="text-sm text-text-muted">
                                {filteredTasks.length} из {tasks.length} задач • {dependencies.length} зависимостей
                            </div>
                        </div>
                    </div>
                    
                    {/* Подсказка для режима создания зависимостей */}
                    {isCreatingDependency && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                <span className="text-lg">💡</span>
                                <span className="font-medium">
                                    {dependencyStart 
                                        ? `Выберите вторую задачу для создания связи: ${dependencyStart.title} → ?`
                                        : 'Кликните на первую задачу, затем на вторую для создания связи'
                                    }
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Гантт диаграмма */}
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-auto">
                        <table 
                            ref={ganttRef}
                            className="w-full border-collapse"
                            onDrop={handleTimelineDrop}
                            onDragOver={handleTimelineDragOver}
                        >
                            {/* Заголовок таблицы */}
                            <thead className="sticky top-0 z-10 bg-secondary-bg">
                                <tr>
                                    <th className="w-80 p-4 text-left border-b border-r border-border-color">
                                        <h3 className="font-semibold text-text-primary">Задачи</h3>
                                    </th>
                                    {timeline.map((date, index) => (
                                        <th
                                            key={index}
                                            className="w-16 p-2 text-center text-xs text-text-muted border-b border-r border-border-color"
                                        >
                                            {format(date, 'dd.MM', { locale: ru })}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            
                            {/* Тело таблицы */}
                            <tbody>
                                {filteredTasks && filteredTasks.length > 0 ? filteredTasks.map((task, index) => {
                                    const position = getTaskPosition(task);
                                    return (
                                        <tr 
                                            key={task.id} 
                                            className="hover:bg-secondary-bg"
                                            onDrop={(e) => handleTimelineDrop(e, task)}
                                            onDragOver={handleTimelineDragOver}
                                        >
                                            {/* Левая панель с информацией о задаче */}
                                            <td 
                                                className="w-80 p-3 border-b border-r border-border-color cursor-pointer"
                                                onClick={() => {
                                                    setEditingTask(task);
                                                    setShowTaskEditModal(true);
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${getTaskColor(task.priority)} flex-shrink-0`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-text-primary text-sm truncate">
                                                            {task.code}
                                                        </div>
                                                        <div className="text-text-secondary text-xs truncate">
                                                            {task.title}
                                                        </div>
                                                    </div>
                                                    {task.assignee && (
                                                        <div className="text-text-muted text-xs flex-shrink-0">
                                                            {task.assignee.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            {/* Ячейки временной шкалы */}
                                            {timeline.map((date, dateIndex) => (
                                                <td 
                                                    key={dateIndex}
                                                    className="w-16 p-0 border-b border-r border-border-color relative bg-card-bg"
                                                    onDrop={(e) => handleTimelineDrop(e, task)}
                                                    onDragOver={handleTimelineDragOver}
                                                >
                                                    {/* Вертикальные линии сетки */}
                                                    <div className="absolute top-0 bottom-0 w-px bg-border-color left-0"></div>
                                                    
                                                    {/* Задача в этой ячейке - только если она начинается здесь */}
                                                    {position.left <= (dateIndex / timeline.length) * 100 && 
                                                     position.left + position.width > (dateIndex / timeline.length) * 100 && 
                                                     position.left >= (dateIndex / timeline.length) * 100 && (
                                                        <div
                                                            className={`absolute rounded transition-all duration-300 ${
                                                                isCreatingDependency 
                                                                    ? 'cursor-pointer hover:shadow-lg' 
                                                                    : 'cursor-move'
                                                            } ${
                                                                dependencyStart?.id === task.id 
                                                                    ? 'ring-2 ring-blue-500' 
                                                                    : hoveredTask?.id === task.id 
                                                                    ? 'ring-2 ring-green-500' 
                                                                    : ''
                                                            } ${getTaskColor(task.priority)}`}
                                                            style={{
                                                                left: `${((position.left - (dateIndex / timeline.length) * 100) / (1 / timeline.length))}%`,
                                                                top: '8px',
                                                                height: '34px',
                                                                width: `${(position.width / (1 / timeline.length))}%`,
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                padding: '0 8px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                zIndex: 2,
                                                                minWidth: '60px'
                                                            }}
                                                            draggable
                                                            onDragStart={(e) => handleTaskDragStart(e, task)}
                                                            onDoubleClick={() => !isCreatingDependency && handleTaskEdit(task)}
                                                            onClick={() => {
                                                                if (isCreatingDependency) {
                                                                    if (!dependencyStart) {
                                                                        handleStartDependency(task);
                                                                    } else {
                                                                        handleEndDependency(task);
                                                                    }
                                                                }
                                                            }}
                                                            onMouseEnter={() => handleTaskHover(task)}
                                                            onMouseLeave={handleTaskLeave}
                                                            title={
                                                                isCreatingDependency 
                                                                    ? (dependencyStart ? `Связать с ${task.title}` : `Начать связь с ${task.title}`)
                                                                    : `${task.title} (${task.duration_days} дн.)`
                                                            }
                                                        >
                                                            <div className="truncate">
                                                                {task.title}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={timeline.length + 1} className="p-8 text-center text-text-muted">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📅</div>
                                                <div className="text-lg font-medium">Нет задач для отображения</div>
                                                <div className="text-sm">Создайте задачи в проекте, чтобы увидеть их на Гантт диаграмме</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                    </div>
                </div>

                {/* Легенда */}
                <div className="card">
                    <h3 className="font-semibold text-text-primary mb-4">Легенда</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-sm text-text-secondary">Высокий</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-sm text-text-secondary">Средний</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm text-text-secondary">Низкий</span>
                        </div>
                    </div>
                </div>

                {/* Список зависимостей */}
                {dependencies.length > 0 && (
                    <div className="card">
                        <h3 className="font-semibold text-text-primary mb-4">Зависимости задач</h3>
                        <div className="space-y-2">
                            {dependencies.map((dependency) => {
                                const fromTask = filteredTasks.find(t => t.id === dependency.depends_on_task_id);
                                const toTask = filteredTasks.find(t => t.id === dependency.task_id);
                                
                                if (!fromTask || !toTask) return null;
                                
                                return (
                                    <div key={dependency.id} className="flex items-center justify-between p-3 bg-secondary-bg rounded">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-text-primary">
                                                {fromTask.code}
                                            </span>
                                            <span className="text-text-muted">→</span>
                                            <span className="text-sm font-medium text-text-primary">
                                                {toTask.code}
                                            </span>
                                        </div>
                                        <div className="text-xs text-text-muted">
                                            {dependency.type === 'finish_to_start' && 'Окончание → Начало'}
                                            {dependency.type === 'start_to_start' && 'Начало → Начало'}
                                            {dependency.type === 'finish_to_finish' && 'Окончание → Окончание'}
                                            {dependency.type === 'start_to_finish' && 'Начало → Окончание'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Модальное окно редактирования задачи */}
                {showTaskEditModal && editingTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-card-bg rounded-lg p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">
                                Редактировать задачу: {editingTask.title}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Дата начала
                                    </label>
                                    <input
                                        type="date"
                                        value={editingTask.start_date || ''}
                                        onChange={(e) => setEditingTask({
                                            ...editingTask,
                                            start_date: e.target.value
                                        })}
                                        className="input w-full"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Продолжительность (дни)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editingTask.duration_days || ''}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                                            setEditingTask({
                                                ...editingTask,
                                                duration_days: value
                                            });
                                        }}
                                        className="input w-full"
                                        placeholder="Введите количество дней"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Прогресс (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editingTask.progress_percent || ''}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                                            setEditingTask({
                                                ...editingTask,
                                                progress_percent: value
                                            });
                                        }}
                                        className="input w-full"
                                        placeholder="Введите процент выполнения"
                                    />
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_milestone"
                                        checked={editingTask.is_milestone || false}
                                        onChange={(e) => setEditingTask({
                                            ...editingTask,
                                            is_milestone: e.target.checked
                                        })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="is_milestone" className="text-sm text-text-secondary">
                                        Веха
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowTaskEditModal(false);
                                        setEditingTask(null);
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={() => handleTaskSave(editingTask.id, {
                                        start_date: editingTask.start_date || null,
                                        duration_days: editingTask.duration_days || null,
                                        progress_percent: editingTask.progress_percent || 0,
                                        is_milestone: editingTask.is_milestone || false
                                    })}
                                    className="btn btn-primary"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
