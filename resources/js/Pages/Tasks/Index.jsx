import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import TaskCard from '@/Components/TaskCard';
import PaymentModal from '@/Components/PaymentModal';
import { getStatusLabel, getPriorityLabel } from '@/utils/statusUtils';

export default function Index({ auth, tasks, filters, projects, users = [], taskStatuses = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [projectId, setProjectId] = useState(filters.project_id || '');
    const [assigneeId, setAssigneeId] = useState(filters.assignee_id || '');
    const [reporterId, setReporterId] = useState(filters.reporter_id || '');
    const [myTasks, setMyTasks] = useState(filters.my_tasks === '1');
    const [showFilters, setShowFilters] = useState(!!(filters.search || filters.status || filters.priority || filters.project_id || filters.assignee_id || filters.reporter_id || filters.my_tasks));
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
                assignee_id: assigneeId,
                reporter_id: reporterId,
                my_tasks: myTasks ? '1' : '',
            };
            
            router.get(route('tasks.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [status, priority, projectId, assigneeId, reporterId, myTasks]
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
        if (filter === 'project_id') setProjectId(value);
        if (filter === 'assignee_id') setAssigneeId(value);
        if (filter === 'reporter_id') setReporterId(value);
        if (filter === 'my_tasks') setMyTasks(value === '1');

        const newFilters = {
            search,
            status: filter === 'status' ? value : status,
            priority: filter === 'priority' ? value : priority,
            project_id: filter === 'project_id' ? value : projectId,
            assignee_id: filter === 'assignee_id' ? value : assigneeId,
            reporter_id: filter === 'reporter_id' ? value : reporterId,
            my_tasks: filter === 'my_tasks' ? value : (myTasks ? '1' : ''),
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
        setAssigneeId('');
        setReporterId('');
        setMyTasks(false);
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
                {/* Заголовок и кнопка создания */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Задачи</h1>
                        <p className="text-text-secondary mt-1">Управление задачами и их выполнением</p>
                    </div>
                    <div className="flex flex-col gap-3 mt-4 sm:mt-0 sm:flex-row sm:space-x-3 sm:items-center">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary inline-flex items-center justify-center h-11"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Фильтры
                        </button>
                        <button
                            onClick={() => {
                                // Проверяем, есть ли у пользователя активная подписка
                                const isPaid = auth.user?.paid && (!auth.user?.expires_at || new Date(auth.user.expires_at) > new Date());
                                if (!isPaid) {
                                    openPaymentModal();
                                } else {
                                    router.visit(route('ai-agent.index'));
                                }
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center h-11 text-sm"
                            style={{ color: 'white' }}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Задача с ИИ
                        </button>
                        <Link
                            href={route('tasks.create')}
                            className="btn btn-primary inline-flex items-center justify-center h-11"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Новая задача
                        </Link>
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
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="form-label">
                                        Поиск по названию
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            placeholder="Введите название задачи..."
                                            className="form-input pr-10"
                                        />
                                        {isSearching && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <svg className="animate-spin h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">
                                        Статус задачи
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">Все статусы</option>
                                        {taskStatuses.map((taskStatus) => (
                                            <option key={taskStatus.id} value={taskStatus.name}>
                                                {taskStatus.name}
                                            </option>
                                        ))}
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
                                {/* Исполнитель */}
                                <div>
                                    <label className="form-label">Исполнитель</label>
                                    <select
                                        value={assigneeId}
                                        onChange={e => handleFilterChange('assignee_id', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">Все исполнители</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name} {user.email ? `(${user.email})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Создатель */}
                                <div>
                                    <label className="form-label">Создатель</label>
                                    <select
                                        value={reporterId}
                                        onChange={e => handleFilterChange('reporter_id', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">Все создатели</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name} {user.email ? `(${user.email})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Мои задачи */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="my_tasks"
                                    checked={myTasks}
                                    onChange={e => handleFilterChange('my_tasks', e.target.checked ? '1' : '')}
                                    className="form-checkbox"
                                />
                                <label htmlFor="my_tasks" className="text-sm">Мои задачи</label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Подсказка по поиску */}
                {(search || status || priority || projectId || assigneeId || reporterId || myTasks) && tasks.data.length === 0 && (
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
                            <h3 className="text-lg font-semibold text-text-primary">
                                Найдено задач: {tasks.data.length}
                            </h3>
                            <div className="text-sm text-text-secondary">
                                {search && `Поиск: "${search}"`}
                                {status && ` • Статус: ${getStatusLabel(status)}`}
                                {priority && ` • Приоритет: ${getPriorityLabel(priority)}`}
                                {projectId && ` • Проект: ${projects.find(p => p.id == projectId)?.name}`}
                                {assigneeId && ` • Исполнитель: ${users.find(u => u.id == assigneeId)?.name}`}
                                {reporterId && ` • Создатель: ${users.find(u => u.id == reporterId)?.name}`}
                                {myTasks && ' • Мои задачи'}
                            </div>
                        </div>
                        <div className="grid-cards">
                            {tasks.data.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card text-center">
                        <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h3 className="text-lg font-medium text-text-secondary mb-2">
                            {search || status || priority || projectId || assigneeId || reporterId || myTasks ? 'Задачи не найдены' : 'Задачи отсутствуют'}
                        </h3>
                        <p className="text-text-muted mb-4">
                            {search || status || priority || projectId || assigneeId || reporterId || myTasks
                                ? 'Попробуйте изменить параметры поиска или очистить фильтры'
                                : 'Создайте первую задачу для начала работы'
                            }
                        </p>
                        {!search && !status && !priority && !projectId && !assigneeId && !reporterId && !myTasks && (
                            <Link
                                href={route('tasks.create')}
                                className="btn btn-primary inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Создать задачу
                            </Link>
                        )}
                    </div>
                )}

                {/* Пагинация */}
                {tasks.data.length > 0 && tasks.links && tasks.links.length > 3 && (
                    <div className="flex justify-center">
                        <nav className="flex space-x-2">
                            {tasks.links.map((link, index) => {
                                // Заменяем английские тексты на русские
                                let label = link.label;
                                if (label.includes('Previous')) {
                                    label = label.replace('Previous', 'Предыдущая');
                                } else if (label.includes('Next')) {
                                    label = label.replace('Next', 'Следующая');
                                }
                                
                                return link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-secondary-bg text-text-primary'
                                                : 'bg-card-bg text-text-primary hover:bg-secondary-bg'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-card-bg text-text-muted cursor-not-allowed`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </nav>
                    </div>
                )}

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