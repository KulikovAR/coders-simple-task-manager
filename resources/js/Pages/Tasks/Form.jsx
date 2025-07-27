import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TaskForm from '@/Components/TaskForm';

export default function Form({ auth, task = null, projects = [], selectedProjectId = null, selectedSprintId = null, sprints = [], errors = {}, members = [] }) {
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
        if (isEditing) {
            router.put(route('tasks.update', task.id), data);
        } else {
            router.post(route('tasks.store'), data);
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
                    members={members}
                    errors={errors}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isModal={false}
                />
            </div>
        </AuthenticatedLayout>
    );
} 