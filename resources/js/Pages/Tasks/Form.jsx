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
                <h2 className="font-semibold text-xl text-green-400 leading-tight">
                    {isEditing ? 'Редактировать задачу' : 'Новая задача'}
                </h2>
            }
        >
            <Head title={isEditing ? 'Редактировать задачу' : 'Новая задача'} />

            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Название */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
                                Название задачи *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                                    formErrors.title ? 'border-red-500' : 'border-gray-700'
                                }`}
                                placeholder="Введите название задачи"
                            />
                            {formErrors.title && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.title}</p>
                            )}
                        </div>

                        {/* Описание */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
                                Описание
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                                    formErrors.description ? 'border-red-500' : 'border-gray-700'
                                }`}
                                placeholder="Опишите задачу..."
                            />
                            {formErrors.description && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.description}</p>
                            )}
                        </div>

                        {/* Проект */}
                        <div>
                            <label htmlFor="project_id" className="block text-sm font-medium text-gray-400 mb-2">
                                Проект *
                            </label>
                            <select
                                id="project_id"
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500 ${
                                    formErrors.project_id ? 'border-red-500' : 'border-gray-700'
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
                                <p className="mt-1 text-sm text-red-400">{formErrors.project_id}</p>
                            )}
                        </div>

                        {/* Статус */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-2">
                                Статус
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500 ${
                                    formErrors.status ? 'border-red-500' : 'border-gray-700'
                                }`}
                            >
                                <option value="todo">К выполнению</option>
                                <option value="in_progress">В работе</option>
                                <option value="review">На проверке</option>
                                <option value="done">Завершена</option>
                            </select>
                            {formErrors.status && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.status}</p>
                            )}
                        </div>

                        {/* Приоритет */}
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-400 mb-2">
                                Приоритет
                            </label>
                            <select
                                id="priority"
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500 ${
                                    formErrors.priority ? 'border-red-500' : 'border-gray-700'
                                }`}
                            >
                                <option value="">Не указан</option>
                                <option value="low">Низкий</option>
                                <option value="medium">Средний</option>
                                <option value="high">Высокий</option>
                            </select>
                            {formErrors.priority && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.priority}</p>
                            )}
                        </div>

                        {/* Дедлайн */}
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-400 mb-2">
                                Дедлайн
                            </label>
                            <input
                                id="deadline"
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500 ${
                                    formErrors.deadline ? 'border-red-500' : 'border-gray-700'
                                }`}
                            />
                            {formErrors.deadline && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.deadline}</p>
                            )}
                        </div>

                        {/* Результат */}
                        <div>
                            <label htmlFor="result" className="block text-sm font-medium text-gray-400 mb-2">
                                Результат
                            </label>
                            <textarea
                                id="result"
                                value={data.result}
                                onChange={(e) => setData('result', e.target.value)}
                                rows={3}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                                    formErrors.result ? 'border-red-500' : 'border-gray-700'
                                }`}
                                placeholder="Опишите результат выполнения задачи..."
                            />
                            {formErrors.result && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.result}</p>
                            )}
                        </div>

                        {/* Merge Request */}
                        <div>
                            <label htmlFor="merge_request" className="block text-sm font-medium text-gray-400 mb-2">
                                Ссылка на Merge Request
                            </label>
                            <input
                                id="merge_request"
                                type="url"
                                value={data.merge_request}
                                onChange={(e) => setData('merge_request', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-blue-400 placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                                    formErrors.merge_request ? 'border-red-500' : 'border-gray-700'
                                }`}
                                placeholder="https://github.com/..."
                            />
                            {formErrors.merge_request && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.merge_request}</p>
                            )}
                        </div>

                        {/* Кнопки */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
                            <a
                                href={route('tasks.index')}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Отмена
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
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