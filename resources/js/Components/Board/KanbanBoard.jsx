import StatusColumn from './StatusColumn';

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
    handleTaskTouchEnd
}) {
    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <div /> {/* пустой div для выравнивания */}
            </div>
            {/* Горизонтальный скролл для колонок, занимает весь экран */}
            <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent"
                 style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
                {taskStatuses.map((status) => {
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
                        />
                    );
                })}
            </div>
        </div>
    );
}
