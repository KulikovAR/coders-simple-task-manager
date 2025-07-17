import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Form({ auth, task = null, projects = [], selectedProjectId = null, errors = {} }) {
    const isEditing = !!task;

    const { data, setData, post, put, processing, errors: formErrors } = useForm({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        priority: task?.priority || '',
        project_id: task?.project_id || selectedProjectId || '',
        sprint_id: task?.sprint_id || '',
        deadline: task?.deadline ? task.deadline.split('T')[0] : '',
        result: task?.result || '',
        merge_request: task?.merge_request || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('tasks.update', task.id), data);
        } else {
            post(route('tasks.store'), data);
        }
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

            <div className="max-w-2xl mx-auto">
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Название */}
                        <div>
                            <label htmlFor="title" className="form-label">
                                Название задачи *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`form-input ${
                                    formErrors.title ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                                placeholder="Введите название задачи"
                            />
                            {formErrors.title && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.title}</p>
                            )}
                        </div>

                        {/* Описание */}
                        <div>
                            <label htmlFor="description" className="form-label">
                                Описание
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`form-input ${
                                    formErrors.description ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                                placeholder="Опишите задачу..."
                            />
                            {formErrors.description && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.description}</p>
                            )}
                        </div>

                        {/* Проект */}
                        <div>
                            <label htmlFor="project_id" className="form-label">
                                Проект *
                            </label>
                            <select
                                id="project_id"
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                className={`form-select ${
                                    formErrors.project_id ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                            >
                                <option value="">Выберите проект</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.project_id && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.project_id}</p>
                            )}
                        </div>

                        {/* Статус */}
                        <div>
                            <label htmlFor="status" className="form-label">
                                Статус
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`form-select ${
                                    formErrors.status ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                            >
                                <option value="todo">К выполнению</option>
                                <option value="in_progress">В работе</option>
                                <option value="review">На проверке</option>
                                <option value="done">Завершена</option>
                            </select>
                            {formErrors.status && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.status}</p>
                            )}
                        </div>

                        {/* Приоритет */}
                        <div>
                            <label htmlFor="priority" className="form-label">
                                Приоритет
                            </label>
                            <select
                                id="priority"
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={`form-select ${
                                    formErrors.priority ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                            >
                                <option value="">Не указан</option>
                                <option value="low">Низкий</option>
                                <option value="medium">Средний</option>
                                <option value="high">Высокий</option>
                            </select>
                            {formErrors.priority && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.priority}</p>
                            )}
                        </div>

                        {/* Дедлайн */}
                        <div>
                            <label htmlFor="deadline" className="form-label">
                                Дедлайн
                            </label>
                            <input
                                id="deadline"
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className={`form-input ${
                                    formErrors.deadline ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                            />
                            {formErrors.deadline && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.deadline}</p>
                            )}
                        </div>

                        {/* Результат */}
                        <div>
                            <label htmlFor="result" className="form-label">
                                Результат
                            </label>
                            <textarea
                                id="result"
                                value={data.result}
                                onChange={(e) => setData('result', e.target.value)}
                                rows={3}
                                className={`form-input ${
                                    formErrors.result ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                                placeholder="Опишите результат выполнения задачи..."
                            />
                            {formErrors.result && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.result}</p>
                            )}
                        </div>

                        {/* Merge Request */}
                        <div>
                            <label htmlFor="merge_request" className="form-label">
                                Ссылка на Merge Request
                            </label>
                            <input
                                id="merge_request"
                                type="url"
                                value={data.merge_request}
                                onChange={(e) => setData('merge_request', e.target.value)}
                                className={`form-input ${
                                    formErrors.merge_request ? 'border-accent-red focus:ring-accent-red' : ''
                                }`}
                                placeholder="https://github.com/..."
                            />
                            {formErrors.merge_request && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.merge_request}</p>
                            )}
                        </div>

                        {/* Кнопки */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-border-color">
                            <a
                                href={route('tasks.index')}
                                className="btn btn-secondary"
                            >
                                Отмена
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn btn-primary"
                            >
                                {processing ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 