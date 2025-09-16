import TaskCard from './TaskCard';
import PriorityDropZones from './PriorityDropZones';
import { useState, useRef, useEffect } from 'react';

export default function StatusColumn({
    status,
    tasks,
    project,
    currentSprintId,
    dragOverStatusId,
    draggedTask,
    showPriorityDropZones,
    dragOverPriority,
    getStatusIndicatorColor,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePriorityDragOver,
    handlePriorityDragLeave,
    handlePriorityDrop,
    openTaskModal,
    longPressTriggeredRef,
    handleDragStart,
    handleDragEnd,
    handleTaskTouchStart,
    handleTaskTouchMove,
    handleTaskTouchEnd,
    viewMode,
    onEditStatusesClick,
    allStatuses,
    onStatusesChange,
    isLastCustom,
    isProjectStatuses,
    isDragReorderMode,
    onStartDragReorder,
    onColumnDragStart,
    onColumnDragEnd,
    onColumnDragOver,
    onColumnDragLeave,
    onColumnDrop,
    dragOverColumnId,
    draggedColumnId
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableName, setEditableName] = useState(status.name);
    const [editableColor, setEditableColor] = useState(status.color || '#6B7280');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const columnRef = useRef(null);
    const menuTimeoutRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    // Функция для плавного открытия меню
    const toggleMenu = () => {
        if (menuTimeoutRef.current) {
            clearTimeout(menuTimeoutRef.current);
        }
        
        if (!menuOpen) {
            // Небольшая задержка для плавного открытия
            menuTimeoutRef.current = setTimeout(() => {
                setMenuOpen(true);
            }, 50);
        } else {
            setMenuOpen(false);
        }
    };

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (menuTimeoutRef.current) {
                clearTimeout(menuTimeoutRef.current);
            }
        };
    }, []);

    // Фокус на input при начале редактирования
    const startEditing = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };
    const cancelEditing = () => {
        setIsEditing(false);
        setEditableName(status.name);
        setEditableColor(status.color || '#6B7280');
    };
    const saveEditing = async () => {
        setLoading(true);
        
        // Сохраняем старые значения для возможного отката
        const oldName = status.name;
        const oldColor = status.color;
        
        // Немедленно обновляем UI для отзывчивости
        onStatusesChange && onStatusesChange(
            allStatuses.map(s =>
                s.id === status.id ? { ...s, name: editableName, color: editableColor } : s
            )
        );
        setIsEditing(false);
        
        try {
            const updatedStatuses = allStatuses.map(s => {
                // Гарантируем, что id всегда передаётся для существующих статусов
                const base = { name: s.name, color: s.color, order: s.order };
                if (s.id) base.id = s.id;
                // Если это редактируемый статус — обновляем name/color
                if (s.id === status.id) {
                    base.name = editableName;
                    base.color = editableColor;
                }
                return base;
            });
            await saveStatusesApi(updatedStatuses);
        } catch (e) {
            // В случае ошибки откатываем изменения
            alert('Ошибка при сохранении статуса');
            onStatusesChange && onStatusesChange(
                allStatuses.map(s =>
                    s.id === status.id ? { ...s, name: oldName, color: oldColor } : s
                )
            );
            // Возвращаем в режим редактирования с откатом значений
            setEditableName(oldName);
            setEditableColor(oldColor);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') saveEditing();
        if (e.key === 'Escape') cancelEditing();
    };
    const handleDelete = async () => {
        if (tasks.length > 0) {
            alert('Нельзя удалить статус, пока к нему привязаны задачи. Перенесите задачи в другие статусы.');
            return;
        }
        if (!window.confirm('Удалить этот статус?')) return;
        setLoading(true);
        try {
            const updatedStatuses = allStatuses
                .filter(s => s.id !== status.id)
                .map(s => {
                    const base = { name: s.name, color: s.color, order: s.order };
                    if (s.id) base.id = s.id;
                    return base;
                });
            await saveStatusesApi(updatedStatuses);
            onStatusesChange && onStatusesChange(allStatuses.filter(s => s.id !== status.id));
        } catch (e) {
            alert('Ошибка при удалении статуса');
        } finally {
            setLoading(false);
        }
    };
    // API сохранения статусов
    async function saveStatusesApi(statuses) {
        const url = currentSprintId !== 'none'
            ? `/projects/${project.id}/sprints/${currentSprintId}/statuses`
            : `/projects/${project.id}/statuses`;
        const method = 'PUT';
        const body = JSON.stringify({ statuses });
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        };
        const resp = await fetch(url, { method, headers, body });
        const data = await resp.json();
        if (!resp.ok || !data.success) throw new Error(data.message || 'Ошибка');
        return data.statuses;
    }

    return (
        <div
            ref={columnRef}
            data-status-column="true"
            draggable={isDragReorderMode}
            onDragStart={isDragReorderMode ? onColumnDragStart : undefined}
            onDragEnd={isDragReorderMode ? onColumnDragEnd : undefined}
            className={`bg-secondary-bg border rounded-xl transition-all duration-300 ${
                viewMode === 'list' 
                    ? 'p-4 w-full' 
                    : 'p-5 flex-shrink-0 w-64 md:w-72 lg:w-80 min-h-full max-h-full'
            } flex flex-col ${
                isDragReorderMode && dragOverColumnId === status.id
                    ? 'border-accent-green bg-accent-green/10 shadow-glow-green scale-105'
                    : isDragReorderMode && draggedColumnId === status.id
                        ? 'opacity-50'
                        : dragOverStatusId === status.id
                            ? 'border-accent-blue bg-accent-blue/5 shadow-glow-blue'
                            : 'border-border-color shadow-md hover:shadow-lg'
            } ${
                isDragReorderMode ? 'shake-animation cursor-move' : ''
            }`}
            onDragOver={(e) => {
                if (isDragReorderMode) {
                    onColumnDragOver && onColumnDragOver(e);
                } else {
                    handleDragOver(e, status.id);
                }
            }}
            onDragLeave={(e) => {
                if (isDragReorderMode) {
                    onColumnDragLeave && onColumnDragLeave(e);
                } else {
                    handleDragLeave(e, status.id);
                }
            }}
            onDrop={(e) => {
                if (isDragReorderMode) {
                    onColumnDrop && onColumnDrop(e);
                } else {
                    handleDrop(e, status.id);
                }
            }}
        >
            {/* Улучшенный заголовок колонки с индикатором */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-color">
                {/* Левая часть с цветом и названием */}
                <div className="flex items-center min-w-0 flex-1">
                    <div
                        className="w-5 h-5 flex-shrink-0 rounded-full shadow-md relative flex items-center justify-center mr-3"
                        style={{ backgroundColor: isEditing ? editableColor : getStatusIndicatorColor(status.id), border: isEditing ? '2px solid #d1d5db' : 'none', cursor: isEditing ? 'pointer' : 'default' }}
                    >
                        {isEditing && (
                            <>
                                <input
                                    type="color"
                                    value={editableColor}
                                    onChange={e => setEditableColor(e.target.value)}
                                    className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer border-none bg-transparent"
                                    style={{ zIndex: 10 }}
                                    tabIndex={0}
                                    onBlur={() => {}} // убираем saveEditing отсюда
                                />
                                <span className="absolute left-0 top-0 w-full h-full rounded-full border border-border-color pointer-events-none"></span>
                            </>
                        )}
                    </div>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editableName}
                            onChange={e => setEditableName(e.target.value)}
                            // onBlur={saveEditing} // убираем auto-save по blur
                            onKeyDown={handleKeyDown}
                            className="text-text-primary font-semibold text-lg bg-card-bg border-b border-accent-blue focus:outline-none focus:border-accent-blue rounded px-1 py-0.5 w-28"
                            disabled={loading}
                        />
                    ) : (
                        <h4 className="text-text-primary font-semibold text-lg truncate">{status.name}</h4>
                    )}
                    {/* Кнопки редактирования */}
                    {isEditing && (
                        <div className="flex items-center gap-1 ml-2">
                            <button
                                className="p-1 rounded hover:bg-accent-green/20 transition-colors"
                                title="Сохранить"
                                onClick={saveEditing}
                                disabled={loading}
                            >
                                <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button
                                className="p-1 rounded hover:bg-red-100 transition-colors"
                                title="Отмена"
                                onClick={cancelEditing}
                                disabled={loading}
                            >
                                <svg className="w-4 h-4 text-red-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Правая часть с кнопками и счетчиком */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Кнопка добавления задачи */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openTaskModal({
                                status_id: status.id,
                                project_id: project.id,
                                sprint_id: currentSprintId !== 'none' ? currentSprintId : null
                            });
                        }}
                        className="p-1.5 hover:bg-secondary-bg rounded-lg transition-colors"
                        title="Создать задачу"
                    >
                        <svg className="w-4 h-4 text-text-muted hover:text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    
                    {/* Счетчик задач */}
                    <span className="bg-card-bg text-text-primary text-caption px-2 py-1 rounded-full font-medium shadow-md">
                        {tasks.length}
                    </span>
                    
                    {/* Меню управления статусом - скрыто во время редактирования */}
                    {!isEditing && (
                        <div className="relative" ref={menuRef}>
                            <button
                                className="p-1 rounded hover:bg-secondary-bg transition-colors ml-1"
                                title="Меню статуса"
                                onClick={toggleMenu}
                                disabled={loading}
                            >
                                <svg className="w-4 h-4 text-text-muted hover:text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="5" cy="12" r="2" />
                                    <circle cx="12" cy="12" r="2" />
                                    <circle cx="19" cy="12" r="2" />
                                </svg>
                            </button>
                            {menuOpen && !isEditing && (
                                <div className="absolute right-0 z-50 mt-2 w-52 bg-secondary-bg border border-border-color rounded-lg shadow-lg py-1 opacity-0 animate-fade-in-center"
                                     style={{ 
                                         animation: 'fadeInCenter 0.2s ease-out forwards',
                                         animationDelay: '0.01s'
                                     }}>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent-blue/10 text-text-primary flex items-center gap-2 transition-colors"
                                        onClick={() => { 
                                            setMenuOpen(false); 
                                            setTimeout(() => startEditing(), 100);
                                        }}
                                        disabled={loading}
                                    >
                                        <span>✏️</span> <span>Редактировать</span>
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent-blue/10 text-text-primary flex items-center gap-2 transition-colors"
                                        onClick={() => { 
                                            setMenuOpen(false); 
                                            setTimeout(() => onStartDragReorder(), 100);
                                        }}
                                        disabled={loading}
                                    >
                                        <span>🔄</span> <span>Изменить порядок</span>
                                    </button>
                                    {tasks.length === 0 && (
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600 flex items-center gap-2 transition-colors"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                setTimeout(() => handleDelete(), 100);
                                            }}
                                            disabled={loading}
                                        >
                                            <span>🗑</span> <span>Удалить</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Фиксированные зоны приоритетов при перетаскивании в том же статусе */}
            {showPriorityDropZones && parseInt(dragOverStatusId) === parseInt(status.id) && parseInt(draggedTask?.status_id) === parseInt(status.id) && (
                <PriorityDropZones
                    dragOverPriority={dragOverPriority}
                    handlePriorityDragOver={handlePriorityDragOver}
                    handlePriorityDragLeave={handlePriorityDragLeave}
                    handlePriorityDrop={handlePriorityDrop}
                />
            )}

            {/* Улучшенная скроллируемая область с задачами */}
            <div className={`${
                viewMode === 'list' 
                    ? 'space-y-2' 
                    : viewMode === 'compact-board'
                        ? 'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent space-y-2'
                        : 'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent space-y-4'
            }`}>
                {tasks.length === 0 && dragOverStatusId === status.id && !showPriorityDropZones && (
                    <div className="border-2 border-dashed border-accent-blue/30 rounded-xl p-8 text-center bg-accent-blue/5 h-40 flex flex-col items-center justify-center">
                        <div className="text-accent-blue/50 text-4xl mb-3">📋</div>
                        <p className="text-accent-blue/50 text-body-small font-medium">Отпустите задачу здесь</p>
                    </div>
                )}
                {tasks.length === 0 && dragOverStatusId !== status.id && (
                    <div className="border-2 border-dashed border-border-color rounded-xl p-8 text-center bg-secondary-bg/30 h-40 flex flex-col items-center justify-center">
                        <div className="text-text-muted text-4xl mb-3">✨</div>
                        <p className="text-text-muted text-body-small font-medium">Нет задач</p>
                    </div>
                )}
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        project={project}
                        draggedTask={draggedTask}
                        longPressTriggeredRef={longPressTriggeredRef}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        handleTaskTouchStart={handleTaskTouchStart}
                        handleTaskTouchMove={handleTaskTouchMove}
                        handleTaskTouchEnd={handleTaskTouchEnd}
                        openTaskModal={openTaskModal}
                        viewMode={viewMode}
                    />
                ))}
            </div>
        </div>
    );
}
