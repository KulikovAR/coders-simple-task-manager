import { router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
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
    viewMode,
    toggleViewMode,
    searchQuery,
    setSearchQuery
}) {
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const assigneeDropdownRef = useRef(null);

    // Закрываем дропдаун при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
                setIsAssigneeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Получаем выбранного исполнителя
    const selectedAssignee = members.find(m => m.id == assigneeId);

    // Функция для отображения аватарки
    const renderAvatar = (user) => {
        if (user.avatar) {
            return (
                <img
                    src={user.avatar_url}
                    alt={`${user.name} avatar`}
                    className="w-5 h-5 rounded-full object-cover"
                />
            );
        }
        return (
            <div className="w-5 h-5 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-bold flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
            </div>
        );
    };
    return (
        <div className="card">
            <div className="space-y-4">
                {/* Первая строка: основные фильтры */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                        <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
                            {sprints.some(s => s.status === 'active') && (
                                <div className="group relative">
                                    <svg className="w-3 h-3 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                        Активный спринт выбирается по умолчанию, но вы можете переключиться на "Без спринта"
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            )}
                            Спринт
                            {currentSprintId !== 'none' && sprints.find(s => s.id == currentSprintId)?.status === 'active' && (
                                <span className="text-accent-green text-xs">(Активный)</span>
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
                    </div>

                    {/* Исполнитель с аватарками */}
                    <div className="min-w-0" ref={assigneeDropdownRef}>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Исполнитель</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                                className="form-select w-full text-left flex items-center gap-2"
                            >
                                {selectedAssignee ? (
                                    <>
                                        {renderAvatar(selectedAssignee)}
                                        <span className="flex-1 truncate">{selectedAssignee.name}</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-5 h-5 rounded-full bg-accent-slate/20 text-accent-slate text-xs font-bold flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="flex-1 text-text-muted">Все исполнители</span>
                                    </>
                                )}
                                <svg className={`w-4 h-4 text-text-muted transition-transform ${isAssigneeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Дропдаун с исполнителями */}
                            {isAssigneeDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-border-color rounded-lg shadow-lg max-h-60 overflow-auto">
                                    <div className="py-1">
                                        {/* Опция "Все исполнители" */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAssigneeId('');
                                                setIsAssigneeDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent-slate/5 transition-colors"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-accent-slate/20 text-accent-slate text-xs font-bold flex items-center justify-center">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-text-muted">Все исполнители</span>
                                        </button>

                                        {/* Список исполнителей */}
                                        {members.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => {
                                                    setAssigneeId(user.id);
                                                    setIsAssigneeDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent-slate/5 transition-colors ${
                                                    assigneeId == user.id ? 'bg-accent-blue/10 text-accent-blue' : ''
                                                }`}
                                            >
                                                {renderAvatar(user)}
                                                <span className="flex-1 truncate">{user.name}</span>
                                                {assigneeId == user.id && (
                                                    <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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
                </div>

                {/* Вторая строка: только переключение вида */}
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
            </div>
        </div>
    );
}
