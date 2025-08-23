import { Link, router } from '@inertiajs/react';
import TagsInput from '@/Components/TagsInput';
import SearchInput from '@/Components/SearchInput';

export default function BoardFilters({
    project,
    sprints,
    members,
    currentSprintId,
    setCurrentSprintId,
    selectedSprintId,
    isDefaultSprint,
    assigneeId,
    setAssigneeId,
    myTasks,
    setMyTasks,
    tags,
    setTags,
    auth,
    openPaymentModal,
    viewMode,
    toggleViewMode,
    searchQuery,
    setSearchQuery
}) {
    return (
        <div className="card">
            <div className="space-y-4">
                {/* Первая строка: основные фильтры */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Поиск по названию задачи */}
                    <div className="min-w-0">
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                            Поиск задачи
                        </label>
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Поиск по названию..."
                        />
                    </div>
                    
                    {/* Спринты */}
                    <div className="min-w-0">
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                            Спринт
                            {currentSprintId !== 'none' && sprints.find(s => s.id == currentSprintId)?.status === 'active' && (
                                <span className="ml-2 text-accent-green text-xs">(Активный)</span>
                            )}
                        </label>
                        <select
                            value={currentSprintId}
                            onChange={e => {
                                const newSprintId = e.target.value;
                                setCurrentSprintId(newSprintId);
                                // Всегда используем параметр sprint_id для единообразия
                                const url = route('projects.board', project.id) + '?sprint_id=' + newSprintId;
                                router.visit(url, { preserveState: false });
                            }}
                            className="form-select w-full"
                        >
                            <option value="none">Без спринта</option>
                            {sprints.map(sprint => (
                                <option key={sprint.id} value={sprint.id}>
                                    {sprint.name} {sprint.status === 'active' ? '(Активный)' : ''}
                                    {sprint.id == selectedSprintId && sprint.status === 'active' && isDefaultSprint ? ' (по умолчанию)' : ''}
                                </option>
                            ))}
                        </select>
                        {sprints.some(s => s.status === 'active') && !window.location.search.includes('sprint_id=none') && (
                            <p className="text-xs text-text-muted mt-1 break-words">
                                💡 Активный спринт выбирается по умолчанию, но вы можете переключиться на "Без спринта"
                            </p>
                        )}
                    </div>

                    {/* Исполнитель */}
                    <div className="min-w-0">
                        <label className="block text-xs font-medium text-text-secondary mb-1">Исполнитель</label>
                        <select
                            value={assigneeId}
                            onChange={e => setAssigneeId(e.target.value)}
                            className="form-select w-full"
                        >
                            <option value="">Все исполнители</option>
                            {members.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.avatar ? (
                                        <img src={`/storage/${user.avatar}`} alt="avatar" className="inline-block w-4 h-4 rounded-full mr-1 align-middle" />
                                    ) : (
                                        <span className="inline-block w-4 h-4 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-bold mr-1 align-middle text-center">{user.name.charAt(0).toUpperCase()}</span>
                                    )}
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Теги */}
                    <div className="min-w-0">
                        <label className="block text-xs font-medium text-text-secondary mb-1">Теги</label>
                        <TagsInput
                            value={tags}
                            onChange={value => setTags(value)}
                            placeholder="Фильтр по тегам..."
                        />
                    </div>

                    {/* Мои задачи */}
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm text-text-primary select-none cursor-pointer touch-target">
                            <input
                                type="checkbox"
                                checked={myTasks}
                                onChange={e => setMyTasks(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-accent-blue border-border-color focus:ring-2 focus:ring-accent-blue rounded-lg transition-all duration-200 flex-shrink-0"
                            />
                            <span className="break-words">Мои задачи</span>
                        </label>
                    </div>
                </div>

                {/* Вторая строка: кнопки действий */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border-color">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* Кнопка переключения вида */}
                        <button
                            onClick={toggleViewMode}
                            className="btn btn-secondary btn-mobile-stack order-0 text-center flex items-center justify-center gap-2"
                            title={
                                viewMode === 'cards' ? 'Переключиться на компактную доску' :
                                viewMode === 'compact-board' ? 'Переключиться на список' :
                                'Переключиться на карточки'
                            }
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {viewMode === 'cards' ? (
                                    // Иконка сетки (карточки)
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                ) : viewMode === 'compact-board' ? (
                                    // Иконка доски с линиями (компактная доска)
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2H9m0 8V5" />
                                ) : (
                                    // Иконка списка (строки)
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                )}
                            </svg>
                            <span className="hidden sm:inline">
                                {viewMode === 'cards' ? 'Карточки' : viewMode === 'compact-board' ? 'Компактная доска' : 'Список'}
                            </span>
                            <span className="sm:hidden">
                                {viewMode === 'cards' ? 'Карточки' : viewMode === 'compact-board' ? 'Компактно' : 'Список'}
                            </span>
                        </button>
                        <Link
                            href={route('sprints.create', project.id)}
                            className="btn btn-secondary btn-mobile-stack order-3 sm:order-2 text-center"
                        >
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="hidden sm:inline">Создать спринт</span>
                            <span className="sm:hidden">Спринт</span>
                        </Link>
                        <button
                            onClick={() => {
                                const isPaid = auth.user?.paid && (!auth.user?.expires_at || new Date(auth.user.expires_at) > new Date());
                                if (!isPaid) {
                                    openPaymentModal();
                                } else {
                                    router.visit(route('ai-agent.index'));
                                }
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm text-white btn-mobile-stack order-2 sm:order-3 text-center"
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="hidden sm:inline">Задача с ИИ</span>
                            <span className="sm:hidden">ИИ задача</span>
                        </button>
                        <Link
                            href={route('tasks.create', { project_id: project.id })}
                            className="btn btn-primary btn-mobile-stack btn-mobile-priority order-1 sm:order-4 text-center"
                        >
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="hidden sm:inline">Новая задача</span>
                            <span className="sm:hidden">Задача</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
