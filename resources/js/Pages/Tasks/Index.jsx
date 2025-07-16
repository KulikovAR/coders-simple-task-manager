import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import TaskCard from '@/Components/TaskCard';

export default function Index({ auth, tasks, filters, projects }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [projectId, setProjectId] = useState(filters.project_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('tasks.index'), { search, status, priority, project_id: projectId }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (filter, value) => {
        const newFilters = { search, status, priority, project_id: projectId };
        newFilters[filter] = value;
        
        router.get(route('tasks.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPriority('');
        setProjectId('');
        router.get(route('tasks.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-green-400 leading-tight">Задачи</h2>}
        >
            <Head title="Задачи" />

            <div className="space-y-6">
                {/* Заголовок и кнопка создания */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-400">Задачи</h1>
                        <p className="text-gray-400 mt-1">Управление задачами и их выполнением</p>
                    </div>
                    <Link
                        href={route('tasks.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Новая задача
                    </Link>
                </div>

                {/* Фильтры */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Поиск
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Название задачи..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-blue-400 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Статус
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Все статусы</option>
                                    <option value="todo">К выполнению</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="review">На проверке</option>
                                    <option value="done">Завершена</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Приоритет
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Все приоритеты</option>
                                    <option value="low">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="high">Высокий</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Проект
                                </label>
                                <select
                                    value={projectId}
                                    onChange={(e) => handleFilterChange('project_id', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-blue-400 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Все проекты</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end space-x-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Поиск
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Сброс
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Список задач */}
                {tasks.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.data.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-400 mb-2">Задачи не найдены</h3>
                        <p className="text-gray-500 mb-4">
                            {search || status || priority || projectId ? 'Попробуйте изменить параметры поиска' : 'Создайте первую задачу для начала работы'}
                        </p>
                        {!search && !status && !priority && !projectId && (
                            <Link
                                href={route('tasks.create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Создать задачу
                            </Link>
                        )}
                    </div>
                )}

                {/* Пагинация */}
                {tasks.data.length > 0 && tasks.links && tasks.links.length > 3 && (
                    <div className="flex justify-center">
                        <nav className="flex space-x-2">
                            {tasks.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
} 