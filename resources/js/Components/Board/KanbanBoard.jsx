import StatusColumn from './StatusColumn';
import { useState, useEffect, useRef } from 'react';

export default function KanbanBoard({
    taskStatuses,
    getFilteredStatusTasks,
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
    highlightedTaskId
}) {
    const [statuses, setStatuses] = useState(taskStatuses);
    const [isDragReorderMode, setIsDragReorderMode] = useState(false);
    const [draggedColumnId, setDraggedColumnId] = useState(null);
    const [dragOverColumnId, setDragOverColumnId] = useState(null);
    const [showNewColumnForm, setShowNewColumnForm] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnColor, setNewColumnColor] = useState('#6B7280');
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const dragCounter = useRef(0);

    useEffect(() => { setStatuses(taskStatuses); }, [taskStatuses]);

    // Обработчик клика для выхода из режима перетаскивания
    useEffect(() => {
        if (!isDragReorderMode) return;

        const handleClickOutside = (e) => {
            // Проверяем, что клик был не по колонке статуса
            if (!e.target.closest('[data-status-column]')) {
                stopDragReorderMode();
            }
        };

        // Добавляем небольшую задержку, чтобы не перехватывать клик активации режима
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDragReorderMode]);

    const handleStatusesChange = (newStatuses) => {
        setStatuses(newStatuses);
    };

    // Локальная функция для получения цвета статуса из актуального состояния
    const getLocalStatusIndicatorColor = (statusId) => {
        const status = statuses.find(s => s.id === statusId);
        return status?.color || '#6B7280';
    };

    const handleEditStatusesClick = () => {
        // Здесь будет открытие модалки управления статусами
    };

    const startDragReorderMode = () => {
        setIsDragReorderMode(true);
    };

    const stopDragReorderMode = () => {
        setIsDragReorderMode(false);
        setDraggedColumnId(null);
        setDragOverColumnId(null);
    };

    const handleColumnDragStart = (e, status) => {
        setDraggedColumnId(status.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', status.id);
        dragCounter.current = 0;
    };

    const handleColumnDragEnd = () => {
        setDraggedColumnId(null);
        setDragOverColumnId(null);
        dragCounter.current = 0;
    };

    const handleColumnDragOver = (e, targetStatus) => {
        if (!isDragReorderMode || !draggedColumnId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumnId(targetStatus.id);
    };

    const handleColumnDragLeave = (e) => {
        if (!isDragReorderMode || !draggedColumnId) return;
        e.preventDefault();
        // Проверяем, что мы действительно покидаем область колонки
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverColumnId(null);
        }
    };

    const handleColumnDrop = async (e, targetStatus) => {
        if (!isDragReorderMode || !draggedColumnId) return;
        e.preventDefault();

        setDragOverColumnId(null); // Сбрасываем состояние dragOver

        const draggedStatusId = parseInt(draggedColumnId);
        const targetStatusId = parseInt(targetStatus.id);

        if (draggedStatusId === targetStatusId) {
            setDraggedColumnId(null);
            return;
        }

        const draggedIndex = statuses.findIndex(s => s.id === draggedStatusId);
        const targetIndex = statuses.findIndex(s => s.id === targetStatusId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newStatuses = [...statuses];
        const [draggedStatus] = newStatuses.splice(draggedIndex, 1);
        newStatuses.splice(targetIndex, 0, draggedStatus);

        // Обновляем порядок - используем индекс + 1 как order (сервер ожидает order начиная с 1)
        const reorderedStatuses = newStatuses.map((status, index) => ({
            ...status,
            order: index + 1
        }));

        setStatuses(reorderedStatuses);

        try {
            // Правильно передаём данные в том порядке, как они должны быть
            const statusesForApi = reorderedStatuses.map(s => {
                const base = {
                    name: s.name,
                    color: s.color,
                    order: s.order
                };
                if (s.id) base.id = s.id;
                return base;
            });

            const result = await saveStatusesApi(statusesForApi);

            // Обновляем состояние с результатом с сервера
            if (result && result.length) {
                setStatuses(result);
            }

        } catch (error) {
            console.error('Ошибка при сохранении порядка колонок:', error);
            setStatuses(taskStatuses); // Откатываем изменения
            alert('Ошибка при сохранении порядка колонок');
        }
    };

    const createNewColumn = async () => {
        if (!newColumnName.trim()) return;

        setIsCreatingColumn(true);
        try {
            const newStatus = {
                name: newColumnName.trim(),
                color: newColumnColor,
                order: 1 // Новый статус добавляется в начало
            };

            // Обновляем порядок существующих статусов
            const updatedExistingStatuses = statuses.map(s => ({
                ...s,
                order: s.order + 1
            }));

            const updatedStatuses = [newStatus, ...updatedExistingStatuses];
            const result = await saveStatusesApi(updatedStatuses.map(s => {
                const base = { name: s.name, color: s.color, order: s.order };
                if (s.id) base.id = s.id;
                return base;
            }));

            // Обновляем состояние с результатом с сервера
            if (result && result.length) {
                setStatuses(result);
            } else {
                setStatuses(updatedStatuses);
            }

            setShowNewColumnForm(false);
            setNewColumnName('');
            setNewColumnColor('#6B7280');
        } catch (error) {
            console.error('Ошибка при создании новой колонки:', error);
            alert('Ошибка при создании новой колонки');
        } finally {
            setIsCreatingColumn(false);
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

        if (!resp.ok || !data.success) {
            throw new Error(data.message || 'Ошибка');
        }
        return data.statuses;
    }
    return (
        <div className={`card ${isDragReorderMode ? 'drag-mode' : ''}`}>
            <div className="flex justify-start items-center mb-6">
                <div className="flex items-center gap-4">
                    {isDragReorderMode && (
                        <div className="flex items-center gap-2">
                            <span className="text-accent-blue text-sm font-medium animate-pulse">📱 Перетаскивайте колонки • Кликните вне для завершения</span>
                        </div>
                    )}
                    {!isDragReorderMode && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    // Получаем первый статус из списка
                                    const firstStatus = taskStatuses[0];
                                    if (firstStatus) {
                                        openTaskModal({
                                            title: '',
                                            description: '',
                                            status_id: firstStatus.id,
                                            project_id: project.id,
                                            sprint_id: currentSprintId !== 'none' ? currentSprintId : null,
                                            priority: 'medium',
                                            tags: []
                                        });
                                    }
                                }}
                                className="btn btn-primary bg-accent-purple hover:bg-accent-purple/90"
                            >
                                Новая задача
                            </button>
                            <button
                                onClick={() => setShowNewColumnForm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-text-primary hover:text-accent-blue transition-colors"
                                title="Добавить новую колонку"
                            >
                                Новый статус
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Форма создания новой колонки */}
            {showNewColumnForm && (
                <div className="card mb-6">
                    <h3 className="text-lg ml-3 font-semibold text-text-primary mb-4">Создать новый статус</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-border-color cursor-pointer shadow-sm relative flex items-center justify-center"
                                    style={{ backgroundColor: newColumnColor }}
                                    title="Цвет колонки"
                                >
                                    <input
                                        type="color"
                                        value={newColumnColor}
                                        onChange={(e) => setNewColumnColor(e.target.value)}
                                        className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer border-none bg-transparent rounded-full"
                                        style={{ zIndex: 10 }}
                                    />
                                </div>
                            </div>
                            <input
                                type="text"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') createNewColumn();
                                    if (e.key === 'Escape') {
                                        setShowNewColumnForm(false);
                                        setNewColumnName('');
                                        setNewColumnColor('#6B7280');
                                    }
                                }}
                                placeholder="Название статуса"
                                className="form-input w-64"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={createNewColumn}
                                disabled={!newColumnName.trim() || isCreatingColumn}
                                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingColumn ? 'Создание...' : 'Создать'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewColumnForm(false);
                                    setNewColumnName('');
                                    setNewColumnColor('#6B7280');
                                }}
                                className="btn btn-secondary"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Горизонтальный скролл для колонок в режиме карточек, вертикальная стопка в списочном режиме */}
            <div className={viewMode === 'list' ?
                "space-y-4" :
                "flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent"
            }
                 style={viewMode !== 'list' ? { height: 'calc(100vh - 200px)', minHeight: '500px' } : {}}>
                {statuses.map((status) => {
                    const statusTasks = getFilteredStatusTasks(status.id);
                    return (
                        <StatusColumn
                            key={status.id}
                            status={status}
                            tasks={statusTasks}
                            project={project}
                            currentSprintId={currentSprintId}
                            dragOverStatusId={dragOverStatusId}
                            draggedTask={draggedTask}
                            showPriorityDropZones={showPriorityDropZones}
                            dragOverPriority={dragOverPriority}
                            getStatusIndicatorColor={getLocalStatusIndicatorColor}
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
                            allStatuses={statuses}
                            onStatusesChange={handleStatusesChange}
                            isDragReorderMode={isDragReorderMode}
                            onStartDragReorder={startDragReorderMode}
                            onColumnDragStart={(e) => handleColumnDragStart(e, status)}
                            onColumnDragEnd={handleColumnDragEnd}
                            onColumnDragOver={(e) => handleColumnDragOver(e, status)}
                            onColumnDragLeave={handleColumnDragLeave}
                            onColumnDrop={(e) => handleColumnDrop(e, status)}
                            dragOverColumnId={dragOverColumnId}
                            draggedColumnId={draggedColumnId}
                            highlightedTaskId={highlightedTaskId}
                        />
                    );
                })}
            </div>
        </div>
    );
}
