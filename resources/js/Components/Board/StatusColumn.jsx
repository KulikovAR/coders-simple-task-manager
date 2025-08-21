import TaskCard from './TaskCard';
import PriorityDropZones from './PriorityDropZones';

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
    viewMode
}) {
    return (
        <div
            className={`bg-secondary-bg border rounded-xl transition-all duration-300 ${
                viewMode === 'list' 
                    ? 'p-4 w-full' 
                    : 'p-5 flex-shrink-0 w-64 md:w-72 lg:w-80 min-h-full max-h-full'
            } flex flex-col ${
                dragOverStatusId === status.id
                    ? 'border-accent-blue bg-accent-blue/5 shadow-glow-blue'
                    : 'border-border-color shadow-md hover:shadow-lg'
            }`}
            onDragOver={(e) => handleDragOver(e, status.id)}
            onDragLeave={(e) => handleDragLeave(e, status.id)}
            onDrop={(e) => handleDrop(e, status.id)}
        >
            {/* Улучшенный заголовок колонки с индикатором */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-color">
                <div className="flex items-center space-x-3">
                    <div
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{ backgroundColor: getStatusIndicatorColor(status.id) }}
                    ></div>
                    <h4 className="text-text-primary font-semibold text-lg">{status.name}</h4>
                </div>
                <div className="flex items-center gap-2">
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
                    <span className="bg-card-bg text-text-primary text-caption px-3 py-1.5 rounded-full font-medium shadow-md">
                        {tasks.length}
                    </span>
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
