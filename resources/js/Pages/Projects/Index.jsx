import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ProjectCard from '@/Components/ProjectCard';

export default function Index({ auth, projects, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

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
        router.get(route('projects.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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

                {/* Фильтры */}
                <div className="card">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="form-label">
                                    Поиск
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Название проекта..."
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    Статус
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

                {/* Список проектов */}
                {projects.data.length > 0 ? (
                    <div className="grid-cards">
                        {projects.data.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center">
                        <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-text-secondary mb-2">Проекты не найдены</h3>
                        <p className="text-text-muted mb-4">
                            {search || status ? 'Попробуйте изменить параметры поиска' : 'Создайте первый проект для начала работы'}
                        </p>
                        {!search && !status && (
                            <Link
                                href={route('projects.create')}
                                className="btn btn-primary"
                            >
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