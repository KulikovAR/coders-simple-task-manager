import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ProjectCard from '@/Components/ProjectCard';
import FilterPanel from '@/Components/FilterPanel';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import PageHeader from '@/Components/PageHeader';
import LimitExceededModal from '@/Components/LimitExceededModal';
import { useFilters } from '@/utils/hooks/useFilters';

export default function Index({ auth, projects, filters, flash, subscriptionInfo, canCreateProject }) {
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [limitError, setLimitError] = useState(null);
    
    const {
        search,
        status,
        showFilters,
        setShowFilters,
        updateFilter,
        clearFilters,
        setSearch,
        setStatus,
    } = useFilters(
        {
            search: filters.search || '',
            status: filters.status || '',
        },
        'projects.index'
    );

    // Проверяем наличие ошибки о превышении лимита в flash-сообщениях
    useEffect(() => {
        // Проверяем наличие данных о превышении лимита
        if (flash?.limitExceeded) {
            setLimitError({
                type: flash.limitExceeded.type,
                limit: flash.limitExceeded.limit,
                plan: flash.limitExceeded.plan
            });
            setShowLimitModal(true);
        }
    }, [flash]);

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-text-primary leading-tight">Проекты</h2>}
        >
            <Head title="Проекты" />

            <div className="space-y-6">
                {/* Модальное окно превышения лимита */}
                {showLimitModal && limitError && (
                    <LimitExceededModal
                        isOpen={showLimitModal}
                        onClose={() => setShowLimitModal(false)}
                        limitType={limitError.type}
                        currentLimit={limitError.limit}
                        currentPlan={limitError.plan}
                    />
                )}
                
                {/* Заголовок и кнопки действий */}
                <PageHeader
                    title="Проекты"
                    description="Управление проектами и задачами"
                    actions={[
                        {
                            type: 'button',
                            variant: 'secondary',
                            text: showFilters ? 'Скрыть фильтры' : 'Показать фильтры',
                            icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
                            onClick: () => {
                                console.log('Toggle filters clicked, current state:', showFilters);
                                setShowFilters(!showFilters);
                            },
                            mobileOrder: 2
                        },
                        canCreateProject ? {
                            type: 'link',
                            variant: 'primary',
                            text: 'Новый проект',
                            icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
                            href: route('projects.create'),
                            mobileOrder: 1
                        } : {
                            type: 'button',
                            variant: 'primary',
                            text: 'Обновить тариф',
                            icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
                            onClick: () => {
                                setLimitError({
                                    type: 'projects',
                                    limit: subscriptionInfo.projects_limit,
                                    plan: subscriptionInfo.name
                                });
                                setShowLimitModal(true);
                            },
                            mobileOrder: 1
                        }
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
                        action={!search && !status ? (
                            canCreateProject ? {
                                href: route('projects.create'),
                                text: 'Создать проект',
                                icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
                            } : {
                                onClick: () => {
                                    setLimitError({
                                        type: 'projects',
                                        limit: subscriptionInfo.projects_limit,
                                        plan: subscriptionInfo.name
                                    });
                                    setShowLimitModal(true);
                                },
                                text: 'Обновить тариф',
                                icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
                            }
                        ) : null}
                    />
                )}

                {/* Пагинация */}
                <Pagination data={projects} />
            </div>
        </AuthenticatedLayout>
    );
} 