import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import TaskCard from '@/Components/TaskCard';
import PaymentModal from '@/Components/PaymentModal';
import FilterPanel from '@/Components/FilterPanel';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import PageHeader from '@/Components/PageHeader';
import { getStatusLabel, getPriorityLabel } from '@/utils/statusUtils';

export default function Index({ auth, tasks, filters, projects, users = [], taskStatuses = [], sprints = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [projectId, setProjectId] = useState(filters.project_id || '');
    const [sprintId, setSprintId] = useState(filters.sprint_id || '');
    const [assigneeId, setAssigneeId] = useState(filters.assignee_id || '');
    const [reporterId, setReporterId] = useState(filters.reporter_id || '');
    const [myTasks, setMyTasks] = useState(filters.my_tasks === '1');
    const [tags, setTags] = useState(filters.tags || '');
    const [showFilters, setShowFilters] = useState(!!(filters.search || filters.status || filters.priority || filters.project_id || filters.sprint_id || filters.assignee_id || filters.reporter_id || filters.my_tasks || filters.tags));
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced поиск
    const debouncedSearch = useCallback(
        (searchValue) => {
            const newFilters = {
                search: searchValue,
                status,
                priority,
                project_id: projectId,
                sprint_id: sprintId,
                assignee_id: assigneeId,
                reporter_id: reporterId,
                my_tasks: myTasks ? '1' : '',
                tags,
            };

            router.get(route('tasks.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [status, priority, projectId, sprintId, assigneeId, reporterId, myTasks]
    );

    useEffect(() => {
        if (search.length > 0) {
            setIsSearching(true);
        }
        const timer = setTimeout(() => {
            debouncedSearch(search);
            setIsSearching(false);
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [search, debouncedSearch]);

    const handleSearchChange = (value) => {
        setSearch(value);
    };

    const handleFilterChange = (filter, value) => {
        // Обновляем локальное состояние
        if (filter === 'status') setStatus(value);
        if (filter === 'priority') setPriority(value);
        if (filter === 'project_id') {
            setProjectId(value);
            // При смене проекта сбрасываем спринт и статус
            setSprintId('');
            setStatus('');
        }
        if (filter === 'sprint_id') setSprintId(value);
        if (filter === 'assignee_id') setAssigneeId(value);
        if (filter === 'reporter_id') setReporterId(value);
        if (filter === 'my_tasks') setMyTasks(value === '1');
        if (filter === 'tags') setTags(value);

        const newFilters = {
            search,
            status: filter === 'status' ? value : (filter === 'project_id' ? '' : status),
            priority: filter === 'priority' ? value : priority,
            project_id: filter === 'project_id' ? value : projectId,
            sprint_id: filter === 'sprint_id' ? value : (filter === 'project_id' ? '' : sprintId),
            assignee_id: filter === 'assignee_id' ? value : assigneeId,
            reporter_id: filter === 'reporter_id' ? value : reporterId,
            my_tasks: filter === 'my_tasks' ? value : (myTasks ? '1' : ''),
            tags: filter === 'tags' ? value : tags,
        };

        router.get(route('tasks.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPriority('');
        setProjectId('');
        setSprintId('');
        setAssigneeId('');
        setReporterId('');
        setMyTasks(false);
        setTags('');
        setShowFilters(false);
        router.get(route('tasks.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
    };



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-text-primary leading-tight">Задачи</h2>}
        >
            <Head title="Задачи" />

            <div className="space-y-6">
                {/* Заголовок и кнопки действий */}
                <PageHeader
                    title="Задачи"
                    description="Управление задачами и их выполнением"
                    actions={[
                        {
                            type: 'button',
                            variant: 'secondary',
                            text: 'Фильтры',
                            icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
                            onClick: () => setShowFilters(!showFilters),
                            mobileOrder: 3
                        },
                        {
                            type: 'button',
                            variant: 'gradient',
                            text: 'Задача с ИИ',
                            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                            onClick: () => {
                                const isPaid = auth.user?.paid && (!auth.user?.expires_at || new Date(auth.user.expires_at) > new Date());
                                if (!isPaid) {
                                    openPaymentModal();
                                } else {
                                    router.visit(route('ai-agent.index'));
                                }
                            },
                            mobileOrder: 2
                        },
                        {
                            type: 'link',
                            variant: 'primary',
                            text: 'Новая задача',
                            icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
                            href: route('tasks.create'),
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
                        onChange: handleSearchChange,
                        placeholder: 'Введите название задачи...',
                        isLoading: isSearching
                    }}
                    filters={[
                        {
                            type: 'select',
                            label: 'Статус задачи',
                            value: status,
                            onChange: (e) => handleFilterChange('status', e.target.value),
                            options: [
                                { value: '', label: 'Все статусы' },
                                ...taskStatuses.map((taskStatus) => ({
                                    value: taskStatus.name,
                                    label: taskStatus.name
                                }))
                            ]
                        },
                        {
                            type: 'select',
                            label: 'Приоритет',
                            value: priority,
                            onChange: (e) => handleFilterChange('priority', e.target.value),
                            options: [
                                { value: '', label: 'Все приоритеты' },
                                { value: 'low', label: 'Низкий' },
                                { value: 'medium', label: 'Средний' },
                                { value: 'high', label: 'Высокий' }
                            ]
                        },
                        {
                            type: 'select',
                            label: 'Проект',
                            value: projectId,
                            onChange: (e) => handleFilterChange('project_id', e.target.value),
                            options: [
                                { value: '', label: 'Все проекты' },
                                ...projects.map((project) => ({
                                    value: project.id,
                                    label: project.name
                                }))
                            ]
                        },
                        {
                            type: 'select',
                            label: 'Спринт',
                            value: sprintId,
                            onChange: (e) => handleFilterChange('sprint_id', e.target.value),
                            disabled: !projectId,
                            options: [
                                { value: '', label: 'Все спринты' },
                                ...sprints.map((sprint) => ({
                                    value: sprint.id,
                                    label: sprint.name
                                }))
                            ]
                        },
                        {
                            type: 'select',
                            label: 'Исполнитель',
                            value: assigneeId,
                            onChange: (e) => handleFilterChange('assignee_id', e.target.value),
                            options: [
                                { value: '', label: 'Все исполнители' },
                                ...users.map(user => ({
                                    value: user.id,
                                    label: `${user.name} ${user.email ? `(${user.email})` : ''}`
                                }))
                            ]
                        },
                        {
                            type: 'select',
                            label: 'Создатель',
                            value: reporterId,
                            onChange: (e) => handleFilterChange('reporter_id', e.target.value),
                            options: [
                                { value: '', label: 'Все создатели' },
                                ...users.map(user => ({
                                    value: user.id,
                                    label: `${user.name} ${user.email ? `(${user.email})` : ''}`
                                }))
                            ]
                        },
                        {
                            type: 'text',
                            label: 'Теги',
                            value: tags,
                            onChange: (e) => handleFilterChange('tags', e.target.value),
                            placeholder: 'Введите теги через пробел'
                        },
                        {
                            type: 'checkbox',
                            label: '',
                            checked: myTasks,
                            onChange: (e) => handleFilterChange('my_tasks', e.target.checked ? '1' : ''),
                            checkboxLabel: 'Мои задачи'
                        }
                    ]}
                />

                {/* Подсказка по поиску */}
                {(search || status || priority || projectId || sprintId || assigneeId || reporterId || myTasks) && tasks.data.length === 0 && (
                    <div className="card bg-gradient-to-r from-accent-yellow/10 to-accent-orange/10 border-accent-yellow/20">
                        <div className="flex items-start space-x-3">
                            <div className="text-accent-yellow text-xl">💡</div>
                            <div>
                                <h3 className="font-medium text-text-primary mb-1">Советы по поиску задач</h3>
                                <div className="text-sm text-text-secondary space-y-1">
                                    <p>• Проверьте правильность написания названия задачи</p>
                                    <p>• Попробуйте использовать более общие термины</p>
                                    <p>• Убедитесь, что выбраны правильные фильтры</p>
                                    <p>• Используйте <button onClick={clearFilters} className="text-accent-blue hover:underline">очистку фильтров</button> для сброса поиска</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {/* Список задач */}
                {tasks.data.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-text-secondary">
                                {search && `Поиск: "${search}"`}
                                {status && ` • Статус: ${getStatusLabel(status)}`}
                                {priority && ` • Приоритет: ${getPriorityLabel(priority)}`}
                                {projectId && ` • Проект: ${projects.find(p => p.id == projectId)?.name}`}
                                {sprintId && ` • Спринт: ${sprints.find(s => s.id == sprintId)?.name}`}
                                {assigneeId && ` • Исполнитель: ${users.find(u => u.id == assigneeId)?.name}`}
                                {reporterId && ` • Создатель: ${users.find(u => u.id == reporterId)?.name}`}
                                {myTasks && ' • Мои задачи'}
                                {tags && ` • Теги: ${tags}`}
                            </div>
                        </div>
                        <div className="grid-cards">
                            {tasks.data.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        title={search || status || priority || projectId || sprintId || assigneeId || reporterId || myTasks || tags ? 'Задачи не найдены' : 'Задачи отсутствуют'}
                        description={search || status || priority || projectId || sprintId || assigneeId || reporterId || myTasks || tags
                            ? 'Попробуйте изменить параметры поиска или очистить фильтры'
                            : 'Создайте первую задачу для начала работы'
                        }
                        icon="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        hasFilters={!!(search || status || priority || projectId || sprintId || assigneeId || reporterId || myTasks || tags)}
                        onClearFilters={clearFilters}
                        action={!search && !status && !priority && !projectId && !sprintId && !assigneeId && !reporterId && !myTasks && !tags ? {
                            href: route('tasks.create'),
                            text: 'Создать задачу',
                            icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
                        } : null}
                    />
                )}

                {/* Пагинация */}
                <Pagination data={tasks} />

                {/* Модальное окно оплаты */}
                {showPaymentModal && (
                    <PaymentModal
                        isOpen={showPaymentModal}
                        onClose={closePaymentModal}
                        user={auth.user}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
