import { Link, router } from '@inertiajs/react';

export default function StatusInfo({
    project,
    sprints,
    currentSprintId,
    currentSprintHasCustomStatuses,
    isDefaultSprint
}) {
    if (currentSprintId !== 'none') {
        return (
            <div className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${currentSprintHasCustomStatuses ? 'bg-accent-blue' : 'bg-accent-slate'}`}></div>
                        <div className="min-w-0 flex-1">
                            <div className="text-body-small text-text-secondary">
                                {currentSprintHasCustomStatuses
                                    ? 'Спринт использует кастомные статусы'
                                    : 'Спринт использует статусы проекта'
                                }
                                {sprints.find(s => s.id == currentSprintId)?.status === 'active' && isDefaultSprint && (
                                    <span className="ml-2 text-accent-green font-medium">• Активный спринт (выбран по умолчанию)</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3 lg:flex-shrink-0">
                        <Link
                            href={route('sprints.statuses', [project.id, currentSprintId])}
                            className="btn btn-secondary btn-sm text-center"
                        >
                            <span className="hidden sm:inline">Настроить статусы</span>
                            <span className="sm:hidden">Статусы</span>
                        </Link>
                        {sprints.find(s => s.id == currentSprintId)?.status === 'active' && isDefaultSprint && (
                            <button
                                onClick={() => {
                                    router.visit(route('projects.board', project.id) + '?sprint_id=none', { preserveState: false });
                                }}
                                className="btn btn-outline btn-sm text-center"
                            >
                                <span className="hidden sm:inline">Переключиться на "Без спринта"</span>
                                <span className="sm:hidden">Без спринта</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Плашка для фильтра "Без спринта" */}
            {currentSprintId === 'none' && (
                <div className="card">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0 bg-accent-slate"></div>
                            <div className="min-w-0 flex-1">
                                <div className="text-body-small text-text-secondary">
                                    Проект использует собственные статусы
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3 lg:flex-shrink-0">
                            <Link
                                href={route('projects.statuses', project.id)}
                                className="btn btn-secondary btn-sm text-center"
                            >
                                <span className="hidden sm:inline">Настроить статусы</span>
                                <span className="sm:hidden">Статусы</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Показываем информацию о том, что активный спринт доступен, только если пользователь не выбрал "Без спринта" явно */}
            {sprints.some(s => s.status === 'active') && !window.location.search.includes('sprint_id=none') && (
                <div className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-accent-green flex-shrink-0"></div>
                            <div className="min-w-0 flex-1">
                                <span className="text-body-small text-text-secondary">
                                    Есть активный спринт. <button
                                        onClick={() => {
                                            const activeSprint = sprints.find(s => s.status === 'active');
                                            if (activeSprint) {
                                                router.visit(route('projects.board', project.id) + '?sprint_id=' + activeSprint.id, { preserveState: false });
                                            }
                                        }}
                                        className="text-accent-blue hover:text-accent-blue/80 underline font-medium"
                                    >
                                        Переключиться на него
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
