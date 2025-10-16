export default function ProjectTableRow({ 
    project, 
    onViewReports, 
    onEditProject,
    isEditingProject = false
}) {
    const lastUpdate = project.updated_at ? new Date(project.updated_at).toLocaleDateString('ru-RU') : '-';

    return (
        <tr className="hover:bg-secondary-bg/50 transition-colors duration-150 border-b border-border-color">
            {/* Проект */}
            <td className="px-6 py-4">
                <div>
                    <h3 className="text-sm font-semibold text-text-primary">{project.name}</h3>
                    <p className="text-xs text-text-muted">{project.domain}</p>
                </div>
            </td>

            {/* Поисковые системы */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {project.search_engines?.includes('google') && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-xs text-text-muted">Google</span>
                        </div>
                    )}
                    {project.search_engines?.includes('yandex') && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#FF0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs text-text-muted">Yandex</span>
                        </div>
                    )}
                    {(!project.search_engines || project.search_engines.length === 0) && (
                        <span className="text-xs text-text-muted">Не настроено</span>
                    )}
                </div>
            </td>

            {/* Последнее обновление */}
            <td className="px-6 py-4">
                <div className="text-sm text-text-primary">{lastUpdate}</div>
            </td>

            {/* Действия */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewReports(project)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent-blue bg-accent-blue/10 rounded-lg hover:bg-accent-blue/20 transition-colors"
                        title="Просмотр отчетов"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Отчеты
                    </button>
                    
                    <button
                        onClick={() => onEditProject(project)}
                        disabled={isEditingProject}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            isEditingProject 
                                ? 'text-accent-purple/60 bg-accent-purple/5 cursor-not-allowed' 
                                : 'text-accent-purple bg-accent-purple/10 hover:bg-accent-purple/20'
                        }`}
                        title={isEditingProject ? "Загрузка данных..." : "Редактировать проект"}
                    >
                        {isEditingProject ? (
                            <>
                                <div className="w-3 h-3 border border-accent-purple/40 border-t-accent-purple rounded-full animate-spin"></div>
                                Загрузка...
                            </>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Редактировать
                            </>
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
}
