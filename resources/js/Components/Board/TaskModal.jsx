import TaskForm from '@/Components/TaskForm';

export default function TaskModal({
    showTaskModal,
    selectedTask,
    processing,
    errors,
    project,
    sprints,
    taskStatuses,
    members,
    auth,
    handleTaskSubmit,
    closeTaskModal,
    setSelectedTask
}) {
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

    if (!showTaskModal || !selectedTask) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Modal container - полноэкранная на мобильных */}
            <div
                className="relative z-50 flex min-h-full lg:items-center lg:justify-center lg:p-4 bg-white/60 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={closeTaskModal}
            >
                <div
                    className="board-modal w-full h-full lg:h-auto lg:max-h-[90vh] lg:rounded-2xl lg:max-w-6xl bg-black/60 border border-slate-200 dark:border-border-color shadow-2xl transform transition-all duration-300 ease-out overflow-hidden backdrop-blur-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Заголовок модалки с градиентом и кнопками */}
                    <div className="bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 dark:border-border-color border-b border-slate-200 backdrop-blur-md p-4 lg:p-6">
                        {/* Десктопная версия - кнопки справа */}
                        <div className="hidden lg:flex justify-between items-start">
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
                                                {getPriorityText(selectedTask.priority)}
                                            </span>
                                        )}
                                        {selectedTask.status && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium border shadow-sm"
                                                  style={selectedTask.status.color ? {
                                                      backgroundColor: `${selectedTask.status.color}20`,
                                                      color: selectedTask.status.color,
                                                      border: `1px solid ${selectedTask.status.color}30`
                                                  } : {
                                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                      color: '#1e293b',
                                                      border: '1px solid #cbd5e1'
                                                  }}>
                                                {selectedTask.status.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 lg:gap-4 !text-white text-xs lg:text-sm">
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
                                            <span>{selectedTask.deadline && selectedTask.deadline !== '0000-00-00' ? new Date(selectedTask.deadline).toLocaleDateString('ru-RU') : 'Нет дедлайна'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Кнопка действия справа на десктопе */}
                            <div className="flex items-center ml-4">
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
                                        selectedTask?.id ? 'Обновить задачу' : 'Создать задачу'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Мобильная версия - кнопки под информацией */}
                        <div className="lg:hidden">
                            {/* Компактная информация о задаче */}
                            <div className="mb-3">
                                {/* Компактная версия заголовка - все элементы в одной строке */}
                                <div className="flex items-center flex-wrap gap-1.5 mb-2">
                                    {selectedTask.code && (
                                        <span className="px-1.5 py-0.5 bg-white/90 dark:bg-transparent rounded text-slate-800 dark:text-white font-mono text-xs border border-slate-300 dark:border-white shadow-sm flex-shrink-0">
                                            {selectedTask.code}
                                        </span>
                                    )}
                                    {selectedTask.priority && (
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(selectedTask.priority)} shadow-sm flex-shrink-0`}>
                                            {selectedTask.priority === 'high' ? '🔥' : selectedTask.priority === 'medium' ? '⚡' : '🌱'}
                                        </span>
                                    )}
                                    {selectedTask.status && (
                                        <span className="px-1.5 py-0.5 rounded text-xs font-medium border shadow-sm flex-shrink-0"
                                              style={selectedTask.status.color ? {
                                                  backgroundColor: `${selectedTask.status.color}20`,
                                                  color: selectedTask.status.color,
                                                  border: `1px solid ${selectedTask.status.color}30`
                                              } : {
                                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                  color: '#1e293b',
                                                  border: '1px solid #cbd5e1'
                                              }}>
                                            {selectedTask.status.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 !text-white text-xs">
                                    {selectedTask.assignee && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-white/90 dark:bg-transparent rounded-full flex items-center justify-center border border-slate-300 dark:border-white shadow-sm">
                                                <span className="text-xs font-medium text-slate-800 dark:text-white">
                                                    {selectedTask.assignee.name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                            <span className="truncate max-w-[100px] drop-shadow-sm text-xs">{selectedTask.assignee.name}</span>
                                        </div>
                                    )}
                                    {selectedTask.deadline && selectedTask.deadline !== '0000-00-00' && (
                                        <div className="flex items-center gap-1 drop-shadow-sm">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-xs">{new Date(selectedTask.deadline).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Кнопка действия на мобильных */}
                            <div className="flex">
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
                                    className="bg-accent-blue hover:bg-accent-blue/80 disabled:bg-accent-blue/50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md flex-1"
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
                                        selectedTask?.id ? 'Обновить задачу' : 'Создать задачу'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Содержимое модалки с корректной высотой */}
                    <div className="overflow-y-auto scrollbar-thin h-[calc(100vh-200px)] lg:max-h-[calc(90vh-200px)]">
                        <TaskForm
                            task={selectedTask}
                            projects={[project]}
                            sprints={sprints}
                            taskStatuses={taskStatuses}
                            members={members}
                            errors={errors}
                            onSubmit={handleTaskSubmit}
                            onCancel={closeTaskModal}
                            isModal={true}
                            processing={processing}
                            auth={auth}
                            onCommentAdded={selectedTask?.id ? (newComment) => {
                                // Обновляем комментарии в локальной задаче только для существующей задачи
                                setSelectedTask(prev => ({
                                    ...prev,
                                    comments: [newComment, ...(prev.comments || [])]
                                }));
                            } : undefined}
                            onCommentUpdated={selectedTask?.id ? (updatedComment) => {
                                // Обновляем комментарии в локальной задаче только для существующей задачи
                                setSelectedTask(prev => ({
                                    ...prev,
                                    comments: prev.comments?.map(comment =>
                                        comment.id === updatedComment.id ? updatedComment : comment
                                    ) || []
                                }));
                            } : undefined}
                            onCommentDeleted={selectedTask?.id ? (deletedCommentId) => {
                                // Удаляем комментарий из локальной задачи только для существующей задачи
                                setSelectedTask(prev => ({
                                    ...prev,
                                    comments: prev.comments?.filter(comment => comment.id !== deletedCommentId) || []
                                }));
                            } : undefined}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
