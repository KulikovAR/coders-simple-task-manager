import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ProjectCard from '@/Components/ProjectCard';

export default function Index({ auth, projects, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(!!(filters.search || filters.status));

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('projects.index'), { search, status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        router.get(route('projects.index'), { search, status: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setShowFilters(false);
        router.get(route('projects.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Статистика проектов
    const getProjectStats = () => {
        const allProjects = projects.data;
        return {
            total: allProjects.length,
            active: allProjects.filter(p => p.status === 'active').length,
            completed: allProjects.filter(p => p.status === 'completed').length,
            onHold: allProjects.filter(p => p.status === 'on_hold').length,
            cancelled: allProjects.filter(p => p.status === 'cancelled').length,
        };
    };

    const stats = getProjectStats();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-text-primary leading-tight">Проекты</h2>}
        >
            <Head title="Проекты" />

            <div className="space-y-6">
                {/* Заголовок и кнопка создания */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Проекты</h1>
                        <p className="text-text-secondary mt-1">Управление проектами и задачами</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary inline-flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Фильтры
                        </button>
                        <Link
                            href={route('projects.create')}
                            className="btn btn-primary inline-flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Новый проект
                        </Link>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-text-primary mb-1">{stats.total}</div>
                        <div className="text-sm text-text-secondary">Всего</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-accent-green mb-1">{stats.active}</div>
                        <div className="text-sm text-text-secondary">Активных</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-accent-blue mb-1">{stats.completed}</div>
                        <div className="text-sm text-text-secondary">Завершенных</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-accent-yellow mb-1">{stats.onHold}</div>
                        <div className="text-sm text-text-secondary">Приостановленных</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-accent-red mb-1">{stats.cancelled}</div>
                        <div className="text-sm text-text-secondary">Отмененных</div>
                    </div>
                </div>

                {/* Фильтры */}
                {showFilters && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="card-title">Фильтры поиска</h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-accent-red hover:text-accent-red/80 transition-colors"
                            >
                                Очистить все
                            </button>
                        </div>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">
                                        Поиск по названию
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Введите название проекта..."
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">
                                        Статус проекта
                                    </label>
                                    <select
                                        value={status}
                                        onChange={handleStatusChange}
                                        className="form-select"
                                    >
                                        <option value="">Все статусы</option>
                                        <option value="active">Активный</option>
                                        <option value="completed">Завершен</option>
                                        <option value="on_hold">Приостановлен</option>
                                        <option value="cancelled">Отменен</option>
                                    </select>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Поиск
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Подсказка по поиску */}
                {(search || status) && projects.data.length === 0 && (
                    <div className="card bg-gradient-to-r from-accent-yellow/10 to-accent-orange/10 border-accent-yellow/20">
                        <div className="flex items-start space-x-3">
                            <div className="text-accent-yellow text-xl">💡</div>
                            <div>
                                <h3 className="font-medium text-text-primary mb-1">Советы по поиску</h3>
                                <div className="text-sm text-text-secondary space-y-1">
                                    <p>• Проверьте правильность написания названия проекта</p>
                                    <p>• Попробуйте использовать более общие термины</p>
                                    <p>• Убедитесь, что выбран правильный статус</p>
                                    <p>• Используйте <button onClick={clearFilters} className="text-accent-blue hover:underline">очистку фильтров</button> для сброса поиска</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Список проектов */}
                {projects.data.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-text-primary">
                                Найдено проектов: {projects.data.length}
                            </h3>
                            <div className="text-sm text-text-secondary">
                                {search && `Поиск: "${search}"`}
                                {status && ` • Статус: ${status}`}
                            </div>
                        </div>
                        <div className="grid-cards">
                            {projects.data.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card text-center">
                        <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-text-secondary mb-2">
                            {search || status ? 'Проекты не найдены' : 'Проекты отсутствуют'}
                        </h3>
                        <p className="text-text-muted mb-4">
                            {search || status 
                                ? 'Попробуйте изменить параметры поиска или очистить фильтры' 
                                : 'Создайте первый проект для начала работы с задачами'
                            }
                        </p>
                        {!search && !status && (
                            <Link
                                href={route('projects.create')}
                                className="btn btn-primary inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Создать проект
                            </Link>
                        )}
                    </div>
                )}

                {/* Пагинация */}
                {projects.data.length > 0 && projects.links && projects.links.length > 3 && (
                    <div className="flex justify-center">
                        <nav className="flex space-x-2">
                            {projects.links.map((link, index) => (
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