import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import TaskCard from '@/Components/TaskCard';
import { getStatusLabel, getPriorityLabel } from '@/utils/statusUtils';

export default function Index({ auth, tasks, filters, projects, users = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [projectId, setProjectId] = useState(filters.project_id || '');
    const [assigneeId, setAssigneeId] = useState(filters.assignee_id || '');
    const [reporterId, setReporterId] = useState(filters.reporter_id || '');
    const [myTasks, setMyTasks] = useState(filters.my_tasks === '1');
    const [showFilters, setShowFilters] = useState(!!(filters.search || filters.status || filters.priority || filters.project_id || filters.assignee_id || filters.reporter_id || filters.my_tasks));

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('tasks.index'), {
            search,
            status,
            priority,
            project_id: projectId,
            assignee_id: assigneeId,
            reporter_id: reporterId,
            my_tasks: myTasks ? '1' : '',
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (filter, value) => {
        const newFilters = {
            search,
            status,
            priority,
            project_id: projectId,
            assignee_id: assigneeId,
            reporter_id: reporterId,
            my_tasks: myTasks ? '1' : '',
        };
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
        setAssigneeId('');
        setReporterId('');
        setMyTasks(false);
        setShowFilters(false);
        router.get(route('tasks.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Статистика задач
    const getTaskStats = () => {
        const allTasks = tasks.data;
        return {
            total: allTasks.length,
            todo: allTasks.filter(t => t.status?.name === 'To Do').length,
            inProgress: allTasks.filter(t => t.status?.name === 'In Progress').length,
            review: allTasks.filter(t => t.status?.name === 'Review').length,
            testing: allTasks.filter(t => t.status?.name === 'Testing').length,
            readyForRelease: allTasks.filter(t => t.status?.name === 'Ready for Release').length,
            done: allTasks.filter(t => t.status?.name === 'Done').length,
            highPriority: allTasks.filter(t => t.priority === 'high').length,
            overdue: allTasks.filter(t => t.deadline && new Date(t.deadline) < new Date()).length,
        };
    };

    const stats = getTaskStats();

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
                            href={route('tasks.create')}
                            className="btn btn-primary inline-flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Новая задача
                        </Link>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <div className="card text-center">
                        <div className="text-xl font-bold text-text-primary mb-1">{stats.total}</div>
                        <div className="text-xs text-text-secondary">Всего</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-xl font-bold text-accent-yellow mb-1">{stats.todo}</div>
                        <div className="text-xs text-text-secondary">К выполнению</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-xl font-bold text-accent-blue mb-1">{stats.inProgress}</div>
                        <div className="text-xs text-text-secondary">В работе</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-xl font-bold text-accent-orange mb-1">{stats.review}</div>
                        <div className="text-xs text-text-secondary">На проверке</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-xl font-bold text-accent-purple mb-1">{stats.testing}</div>
                        <div className="text-xs text-text-secondary">Тестирование</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-xl font-bold text-accent-pink mb-1">{stats.readyForRelease}</div>
                        <div className="text-xs text-text-secondary">К релизу</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-xl font-bold text-accent-green mb-1">{stats.done}</div>
                        <div className="text-xs text-text-secondary">Завершено</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-xl font-bold text-accent-red mb-1">{stats.overdue}</div>
                        <div className="text-xs text-text-secondary">Просрочено</div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="form-label">
                                        Поиск по названию
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Введите название задачи..."
                                        className="form-input"
                                    />
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
                                {/* Мои задачи */}
                                <div className="flex items-center space-x-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="my_tasks"
                                        checked={myTasks}
                                        onChange={e => handleFilterChange('my_tasks', e.target.checked ? '1' : '')}
                                        className="form-checkbox"
                                    />
                                    <label htmlFor="my_tasks" className="text-sm">Мои задачи</label>
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

                {/* Предупреждение о просроченных задачах */}
                {stats.overdue > 0 && (
                    <div className="card bg-gradient-to-r from-accent-red/10 to-accent-orange/10 border-accent-red/20">
                        <div className="flex items-start space-x-3">
                            <div className="text-accent-red text-xl">⚠️</div>
                            <div>
                                <h3 className="font-medium text-text-primary mb-1">Внимание: просроченные задачи</h3>
                                <p className="text-sm text-text-secondary">
                                    У вас есть {stats.overdue} просроченных задач. Рекомендуем проверить их статус и обновить дедлайны.
                                </p>
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
            </div>
        </AuthenticatedLayout>
    );
} 