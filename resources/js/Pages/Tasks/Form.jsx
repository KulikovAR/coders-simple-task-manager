import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TaskForm from '@/Components/TaskForm';

export default function Form({ auth, task = null, projects = [], selectedProjectId = null, selectedSprintId = null, sprints = [], taskStatuses = [], errors = {}, members = [] }) {
    const isEditing = !!task;

    // Приводим selectedProjectId к числу для корректного сравнения
    const defaultProjectId = selectedProjectId ? parseInt(selectedProjectId) : null;
    const defaultSprintId = selectedSprintId ? parseInt(selectedSprintId) : null;

    // Подготавливаем данные для TaskForm
    const taskData = task ? {
        ...task,
        project_id: task.project_id || defaultProjectId,
        sprint_id: task.sprint_id || defaultSprintId,
    } : (defaultProjectId || defaultSprintId) ? {
        project_id: defaultProjectId,
        sprint_id: defaultSprintId,
    } : null;

    const handleSubmit = (data) => {
        // Извлекаем данные чек-листов
        const { checklists, ...taskData } = data;
        
        if (isEditing) {
            // Используем router.visit для корректной обработки ответа от сервера
            router.visit(route('tasks.update', task.id), {
                method: 'put',
                data: taskData,
                preserveState: false
            });
        } else {
            router.post(route('tasks.store'), taskData);
        }
        
        // Если есть изменения чек-листов, отправляем их отдельно
        if (checklists && (checklists.changes.length > 0 || checklists.items.length > 0)) {
            // Отправляем изменения чек-листов через AJAX
            if (checklists.changes.length > 0) {
                checklists.changes.forEach(change => {
                    if (change.type === 'create') {
                        fetch(route('tasks.checklists.store', task.id), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                            },
                            body: JSON.stringify({ title: change.item.title }),
                            credentials: 'same-origin',
                        });
                    } else if (change.type === 'update') {
                        fetch(route('tasks.checklists.update', [task.id, change.item.id]), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                            },
                            body: JSON.stringify({ title: change.item.title }),
                            credentials: 'same-origin',
                        });
                    } else if (change.type === 'toggle') {
                        fetch(route('tasks.checklists.toggle', [task.id, change.item.id]), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                            },
                            credentials: 'same-origin',
                        });
                    } else if (change.type === 'delete') {
                        fetch(route('tasks.checklists.destroy', [task.id, change.item.id]), {
                            method: 'DELETE',
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                            },
                            credentials: 'same-origin',
                        });
                    }
                });
            }
        }
    };

    const handleCancel = () => {
        router.visit(route('tasks.index'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    {isEditing ? 'Редактировать задачу' : 'Новая задача'}
                </h2>
            }
        >
            <Head title={isEditing ? 'Редактировать задачу' : 'Новая задача'} />

            <div className="space-y-6">
                {/* Заголовок и действия */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">
                            {isEditing ? 'Редактирование задачи' : 'Создание новой задачи'}
                        </h1>
                        {isEditing && task?.code && (
                            <div className="text-xs font-mono text-accent-blue mb-2">{task.code}</div>
                        )}
                        <p className="text-text-secondary">
                            {isEditing ? 'Обновите информацию о задаче' : 'Заполните основную информацию о задаче'}
                        </p>
                    </div>
                </div>

                {/* Форма задачи */}
                <TaskForm
                    task={isEditing ? taskData : null}
                    projects={projects}
                    sprints={sprints}
                    taskStatuses={taskStatuses}
                    members={members}
                    errors={errors}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isModal={false}
                    externalChecklists={task?.checklists || []}
                    onChecklistChange={(updatedChecklists) => {
                        setChecklists(updatedChecklists);
                        setSelectedTask(prev => ({
                            ...prev,
                            checklists: updatedChecklists
                        }));
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
} 