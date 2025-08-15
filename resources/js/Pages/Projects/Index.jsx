import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ProjectCard from '@/Components/ProjectCard';
import StatsGrid from '@/Components/StatsGrid';
import FilterPanel from '@/Components/FilterPanel';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, projects, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(!!(filters.search || filters.status));

    // Поиск и фильтрация на лету с дебаунсом
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(route('projects.index'), { search, status }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, status]);

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
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
                <StatsGrid 
                    columns={5}
                    stats={[
                        { label: 'Всего', value: stats.total, color: 'text-text-primary' },
                        { label: 'Активных', value: stats.active, color: 'text-accent-green' },
                        { label: 'Завершенных', value: stats.completed, color: 'text-accent-blue' },
                        { label: 'Приостановленных', value: stats.onHold, color: 'text-accent-yellow' },
                        { label: 'Отмененных', value: stats.cancelled, color: 'text-accent-red' },
                    ]}
                />

                {/* Фильтры */}
                <FilterPanel
                    isVisible={showFilters}
                    onClearFilters={clearFilters}
                    searchConfig={{
                        label: 'Поиск по названию',
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Введите название проекта...'
                    }}
                    filters={[
                        {
                            type: 'select',
                            label: 'Статус проекта',
                            value: status,
                            onChange: handleStatusChange,
                            options: [
                                { value: '', label: 'Все статусы' },
                                { value: 'active', label: 'Активный' },
                                { value: 'completed', label: 'Завершен' },
                                { value: 'on_hold', label: 'Приостановлен' },
                                { value: 'cancelled', label: 'Отменен' }
                            ]
                        }
                    ]}
                />

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
                    <EmptyState 
                        title={search || status ? 'Проекты не найдены' : 'Проекты отсутствуют'}
                        description={search || status 
                            ? 'Попробуйте изменить параметры поиска или очистить фильтры' 
                            : 'Создайте первый проект для начала работы с задачами'
                        }
                        hasFilters={!!(search || status)}
                        onClearFilters={clearFilters}
                        action={!search && !status ? {
                            href: route('projects.create'),
                            text: 'Создать проект',
                            icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
                        } : null}
                    />
                )}

                {/* Пагинация */}
                <Pagination data={projects} />
            </div>
        </AuthenticatedLayout>
    );
} 