import { useState, useEffect } from 'react';
import TaskForm from '@/Components/TaskForm';
import Checklist from '@/Components/Checklist';

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
    // Состояние для чек-листов
    const [checklists, setChecklists] = useState(selectedTask?.checklists || []);

    // Синхронизируем чек-листы при изменении задачи
    useEffect(() => {
        setChecklists(selectedTask?.checklists || []);
    }, [selectedTask?.checklists]);

    // Функция для копирования ссылки на задачу
    const copyTaskLink = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedTask?.id) return;

        const taskUrl = selectedTask.code ? route('tasks.show.by-code', selectedTask.code) : route('tasks.show', selectedTask.id);
        navigator.clipboard.writeText(taskUrl)
            .then(() => {
                // Показываем временное уведомление, проверяя наличие элемента
                const element = e.currentTarget;
                if (element) {
                    const originalText = element.textContent || selectedTask.code;

                    // Сохраняем оригинальное содержимое
                    const originalContent = element.innerHTML;

                    // Заменяем содержимое на уведомление о копировании
                    element.innerHTML = '<span>Скопировано!</span>';

                    setTimeout(() => {
                        // Проверяем, существует ли еще элемент перед восстановлением
                        if (element && element.isConnected) {
                            element.innerHTML = originalContent;
                        }
                    }, 1500);
                }
            })
            .catch(err => {
                console.error('Ошибка при копировании: ', err);
            });
    };
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
        <div className="fixed inset-0 z-50 overflow-hidden" style={{margin: 0}}>
            {/* Стили для скроллбара */}
            <style jsx>{`
                .task-modal-scroll::-webkit-scrollbar {
                    width: 8px;
                }
                .task-modal-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .task-modal-scroll::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.3);
                    border-radius: 4px;
                }
                .task-modal-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
                .dark .task-modal-scroll::-webkit-scrollbar-thumb {
                    background: rgba(75, 85, 99, 0.3);
                }
                .dark .task-modal-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(75, 85, 99, 0.5);
                }
            `}</style>
            
            {/* Затемнение фона */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={closeTaskModal}
            />

            {/* Модальное окно по центру */}
            <div
                className="absolute board-modal top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl mx-0 sm:mx-4 rounded-2xl border border-slate-200 dark:border-border-color shadow-2xl max-h-[90vh] overflow-hidden"
                style={{
                    maxHeight: '90vh',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Заголовок модалки с градиентом и кнопками */}
                <div className="bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 dark:border-border-color border-b border-slate-200 p-2 sm:p-4 lg:p-6">
                    {/* Десктопная версия - кнопки справа */}
                    <div className="hidden lg:flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            {/* Адаптивная версия заголовка */}
                            <div className="flex items-center gap-3 mb-2">
                                {selectedTask.code && (
                                    <span
                                        className="px-2 lg:px-3 py-1 bg-white/90 dark:bg-transparent rounded-full text-white text-slate-800 font-mono text-xs lg:text-sm border border-slate-300 dark:border-white shadow-sm cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 inline-flex items-center"
                                        onClick={copyTaskLink}
                                        title="Нажмите, чтобы скопировать ссылку на задачу"
                                    >
                                        <span className="mr-1">🔗</span>
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

                            <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-slate-800 text-xs lg:text-sm">
                                {selectedTask.assignee && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-white/90 dark:bg-transparent rounded-full flex items-center justify-center border border-slate-300 dark:border-white shadow-sm">
                                            <span className="text-xs font-medium text-slate-800 text-white">
                                                {selectedTask.assignee.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <span className="truncate max-w-[120px] lg:max-w-none  text-white">{selectedTask.assignee.name}</span>
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

                        {/* Кнопки справа на десктопе */}
                        <div className="flex items-center gap-2 ml-4">
                            {/* Кнопка действия - показываем только для новых задач */}
                            {!selectedTask?.id && (
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
                                    className="bg-accent-blue hover:bg-accent-blue/80 disabled:bg-accent-blue/50 text-white font-medium px-4 py-2 rounded-lg text-sm disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
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
                                        'Создать задачу'
                                    )}
                                </button>
                            )}

                            {/* Кнопка закрытия */}
                            <button
                                type="button"
                                onClick={closeTaskModal}
                                className="p-2 text-gray-400/70 hover:text-white hover:bg-white/10 rounded-lg"
                                title="Закрыть"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Мобильная версия - кнопки под информацией */}
                    <div className="lg:hidden">
                        {/* Заголовок с кнопкой закрытия */}
                        <div className="flex justify-end items-center mb-2">
                            <button
                                type="button"
                                onClick={closeTaskModal}
                                className="p-2 text-gray-400/70 hover:text-gray-400 hover:bg-white/10 rounded-lg"
                                title="Закрыть"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Компактная информация о задаче */}
                        <div className="mb-3">
                            {/* Компактная версия заголовка - все элементы в одной строке */}
                            <div className="flex items-center flex-wrap gap-1.5 mb-2">
                                {selectedTask.code && (
                                    <span
                                        className="px-1.5 py-0.5 bg-white/90 dark:bg-transparent text-white rounded text-slate-800 font-mono text-xs border border-slate-300 dark:border-white shadow-sm flex-shrink-0 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 inline-flex items-center"
                                        onClick={copyTaskLink}
                                        title="Нажмите, чтобы скопировать ссылку на задачу"
                                    >
                                        <span className="mr-1">🔗</span>
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

                        {/* Кнопка действия на мобильных - только для новых задач */}
                        {!selectedTask?.id && (
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
                                    className="bg-accent-blue hover:bg-accent-blue/80 disabled:bg-accent-blue/50 text-white font-medium px-4 py-2 rounded-lg text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md flex-1"
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
                                        'Создать задачу'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Содержимое модалки - 3 колонки на десктопе, вертикально на мобильных */}
                <div className="h-[calc(90vh-140px)]">
                    {/* Десктопная версия - 3 колонки с отдельным скроллом */}
                    <div className="hidden lg:flex h-full">
                        {/* Левая колонка - Параметры задачи (25%) */}
                        <div className="w-1/4 border-r border-border-color bg-secondary-bg/30 overflow-y-auto task-modal-scroll">
                            <TaskForm
                                task={selectedTask}
                                projects={[project]}
                                sprints={sprints}
                                taskStatuses={taskStatuses}
                                members={members}
                                errors={errors}
                                onSubmit={(formData) => {
                                    // Обновляем локальное состояние задачи перед отправкой на сервер
                                    const updatedTask = {
                                        ...selectedTask,
                                        ...formData,
                                        // Обновляем связанные объекты
                                        status: formData.status_id ? taskStatuses.find(s => s.id == formData.status_id) : selectedTask.status,
                                        assignee: formData.assignee_id ? members.find(m => m.id == formData.assignee_id) : selectedTask.assignee,
                                        sprint: formData.sprint_id ? sprints.find(s => s.id == formData.sprint_id) : null,
                                    };
                                    setSelectedTask(updatedTask);

                                    // Вызываем оригинальный обработчик
                                    handleTaskSubmit(formData);
                                }}
                                onCancel={closeTaskModal}
                                isModal={true}
                                processing={processing}
                                auth={auth}
                                autoSave={true}
                                showOnlyParams={true}
                            />
                        </div>

                        {/* Центральная колонка - Описание, результат и комментарии (50%) */}
                        <div className="w-1/2 border-r border-border-color overflow-y-auto task-modal-scroll">
                            <TaskForm
                                task={selectedTask}
                                projects={[project]}
                                sprints={sprints}
                                taskStatuses={taskStatuses}
                                members={members}
                                errors={errors}
                                onSubmit={(formData) => {
                                    // Обновляем локальное состояние задачи перед отправкой на сервер
                                    const updatedTask = {
                                        ...selectedTask,
                                        ...formData,
                                        // Обновляем связанные объекты
                                        status: formData.status_id ? taskStatuses.find(s => s.id == formData.status_id) : selectedTask.status,
                                        assignee: formData.assignee_id ? members.find(m => m.id == formData.assignee_id) : selectedTask.assignee,
                                        sprint: formData.sprint_id ? sprints.find(s => s.id == formData.sprint_id) : null,
                                    };
                                    setSelectedTask(updatedTask);

                                    // Вызываем оригинальный обработчик
                                    handleTaskSubmit(formData);
                                }}
                                onCancel={closeTaskModal}
                                isModal={true}
                                processing={processing}
                                auth={auth}
                                autoSave={true}
                                showOnlyContent={true}
                                onCommentAdded={selectedTask?.id ? (newComment) => {
                                    setSelectedTask(prev => ({
                                        ...prev,
                                        comments: [newComment, ...(prev.comments || [])]
                                    }));
                                } : undefined}
                                onCommentUpdated={selectedTask?.id ? (updatedComment) => {
                                    setSelectedTask(prev => ({
                                        ...prev,
                                        comments: prev.comments?.map(comment =>
                                            comment.id === updatedComment.id ? updatedComment : comment
                                        ) || []
                                    }));
                                } : undefined}
                                onCommentDeleted={selectedTask?.id ? (deletedCommentId) => {
                                    setSelectedTask(prev => ({
                                        ...prev,
                                        comments: prev.comments?.filter(comment => comment.id !== deletedCommentId) || []
                                    }));
                                } : undefined}
                            />
                        </div>

                        {/* Правая колонка - Чек-лист и дополнительные элементы (25%) */}
                        <div className="w-1/4 bg-secondary-bg/30 overflow-y-auto task-modal-scroll">
                            {/* Чек-лист для существующих задач */}
                            {selectedTask?.id && (
                                <div className="p-4 border-b border-border-color">
                                    <Checklist
                                        taskId={selectedTask.id}
                                        checklists={checklists}
                                        onChecklistChange={(updatedChecklists) => {
                                            setChecklists(updatedChecklists);
                                            // Обновляем задачу в локальном состоянии
                                            setSelectedTask(prev => ({
                                                ...prev,
                                                checklists: updatedChecklists
                                            }));
                                        }}
                                        isModal={true}
                                    />
                                </div>
                            )}

                            {/* Дополнительная информация */}
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-text-primary mb-3">Информация</h3>
                                <div className="space-y-3 text-xs text-text-secondary">
                                    {selectedTask?.created_at && (
                                        <div>
                                            <span className="font-medium">Создана:</span>
                                            <br />
                                            {new Date(selectedTask.created_at).toLocaleDateString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    )}
                                    {selectedTask?.updated_at && selectedTask.updated_at !== selectedTask.created_at && (
                                        <div>
                                            <span className="font-medium">Обновлена:</span>
                                            <br />
                                            {new Date(selectedTask.updated_at).toLocaleDateString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    )}
                                    {selectedTask?.author && (
                                        <div>
                                            <span className="font-medium">Автор:</span>
                                            <br />
                                            {selectedTask.author.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Мобильная версия - вертикальное расположение с общим скроллом */}
                    <div className="lg:hidden overflow-y-auto h-full task-modal-scroll">
                        {/* 1. Чек-лист для мобильных устройств */}
                        {selectedTask?.id && (
                            <div className="p-2 sm:p-4 border-b border-border-color bg-secondary-bg/30">
                                <Checklist
                                    taskId={selectedTask.id}
                                    checklists={checklists}
                                    onChecklistChange={(updatedChecklists) => {
                                        setChecklists(updatedChecklists);
                                        // Обновляем задачу в локальном состоянии
                                        setSelectedTask(prev => ({
                                            ...prev,
                                            checklists: updatedChecklists
                                        }));
                                    }}
                                    isModal={true}
                                />
                            </div>
                        )}

                        {/* 2. Параметры задачи для мобильных устройств */}
                        <div className="p-2 sm:p-4 border-b border-border-color bg-secondary-bg/30">
                            <TaskForm
                                task={selectedTask}
                                projects={[project]}
                                sprints={sprints}
                                taskStatuses={taskStatuses}
                                members={members}
                                errors={errors}
                                onSubmit={(formData) => {
                                    // Обновляем локальное состояние задачи перед отправкой на сервер
                                    const updatedTask = {
                                        ...selectedTask,
                                        ...formData,
                                        // Обновляем связанные объекты
                                        status: formData.status_id ? taskStatuses.find(s => s.id == formData.status_id) : selectedTask.status,
                                        assignee: formData.assignee_id ? members.find(m => m.id == formData.assignee_id) : selectedTask.assignee,
                                        sprint: formData.sprint_id ? sprints.find(s => s.id == formData.sprint_id) : null,
                                    };
                                    setSelectedTask(updatedTask);

                                    // Вызываем оригинальный обработчик
                                    handleTaskSubmit(formData);
                                }}
                                onCancel={closeTaskModal}
                                isModal={true}
                                processing={processing}
                                auth={auth}
                                autoSave={true}
                                showOnlyParams={true}
                            />
                        </div>

                        {/* 3. Основной контент для мобильных устройств */}
                        <div className="p-2 sm:p-4">
                            <TaskForm
                                task={selectedTask}
                                projects={[project]}
                                sprints={sprints}
                                taskStatuses={taskStatuses}
                                members={members}
                                errors={errors}
                                onSubmit={(formData) => {
                                    // Обновляем локальное состояние задачи перед отправкой на сервер
                                    const updatedTask = {
                                        ...selectedTask,
                                        ...formData,
                                        // Обновляем связанные объекты
                                        status: formData.status_id ? taskStatuses.find(s => s.id == formData.status_id) : selectedTask.status,
                                        assignee: formData.assignee_id ? members.find(m => m.id == formData.assignee_id) : selectedTask.assignee,
                                        sprint: formData.sprint_id ? sprints.find(s => s.id == formData.sprint_id) : null,
                                    };
                                    setSelectedTask(updatedTask);

                                    // Вызываем оригинальный обработчик
                                    handleTaskSubmit(formData);
                                }}
                                onCancel={closeTaskModal}
                                isModal={true}
                                processing={processing}
                                auth={auth}
                                autoSave={true}
                                showOnlyContent={true}
                                onCommentAdded={selectedTask?.id ? (newComment) => {
                                    setSelectedTask(prev => ({
                                        ...prev,
                                        comments: [newComment, ...(prev.comments || [])]
                                    }));
                                } : undefined}
                                onCommentUpdated={selectedTask?.id ? (updatedComment) => {
                                    setSelectedTask(prev => ({
                                        ...prev,
                                        comments: prev.comments?.map(comment =>
                                            comment.id === updatedComment.id ? updatedComment : comment
                                        ) || []
                                    }));
                                } : undefined}
                                onCommentDeleted={selectedTask?.id ? (deletedCommentId) => {
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
        </div>
    );
}
