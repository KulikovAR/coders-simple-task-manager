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
            header={<h2 className="font-semibold text-xl text-text-primary leading-tight">Задачи</h2>}
        >
            <Head title="Задачи" />

            <div className="space-y-6">
                {/* Заголовок и кнопка создания */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Задачи</h1>
                        <p className="text-text-secondary mt-1">Управление задачами и их выполнением</p>
                    </div>
                    <Link
                        href={route('tasks.create')}
                        className="btn btn-primary inline-flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Новая задача
                    </Link>
                </div>

                {/* Фильтры */}
                <div className="card">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="form-label">
                                    Поиск
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Название задачи..."
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    Статус
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Все статусы</option>
                                    <option value="To Do">К выполнению</option>
                                    <option value="In Progress">В работе</option>
                                    <option value="Review">На проверке</option>
                                    <option value="Testing">Тестирование</option>
                                    <option value="Ready for Release">Готов к релизу</option>
                                    <option value="Done">Завершена</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">
                                    Приоритет
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Все приоритеты</option>
                                    <option value="low">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="high">Высокий</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">
                                    Проект
                                </label>
                                <select
                                    value={projectId}
                                    onChange={(e) => handleFilterChange('project_id', e.target.value)}
                                    className="form-select"
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
                                    className="btn btn-primary"
                                >
                                    Поиск
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="btn btn-secondary"
                                >
                                    Сброс
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Список задач */}
                {tasks.data.length > 0 ? (
                    <div className="grid-cards">
                        {tasks.data.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center">
                        <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h3 className="text-lg font-medium text-text-secondary mb-2">Задачи не найдены</h3>
                        <p className="text-text-muted mb-4">
                            {search || status || priority || projectId ? 'Попробуйте изменить параметры поиска' : 'Создайте первую задачу для начала работы'}
                        </p>
                        {!search && !status && !priority && !projectId && (
                            <Link
                                href={route('tasks.create')}
                                className="btn btn-primary"
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
                                            ? 'bg-secondary-bg text-text-primary'
                                            : link.url
                                            ? 'bg-card-bg text-text-primary hover:bg-secondary-bg'
                                            : 'bg-card-bg text-text-muted cursor-not-allowed'
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