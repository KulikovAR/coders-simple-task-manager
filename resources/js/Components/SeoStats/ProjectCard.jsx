export default function ProjectCard({ project, keywords, onViewReports, onAddKeywords, onTrackPositions }) {
    const keywordsCount = project.keywords_count || 0;

    return (
        <div className="bg-card-bg border border-border-color rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 
                        className="text-xl font-semibold text-text-primary mb-2 cursor-pointer hover:text-accent-blue transition-colors"
                        onClick={() => onViewReports(project)}
                    >
                        {project.name}
                    </h3>
                    <a 
                        href={project.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted text-sm mb-3 hover:text-accent-blue transition-colors block"
                    >
                        {project.domain}
                    </a>
                    
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {keywordsCount} ключевых слов
                        </div>
                        
                        {project.search_engines && project.search_engines.length > 0 && (
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {project.search_engines.join(', ')}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {project.search_engines?.includes('google') && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    )}
                    {project.search_engines?.includes('yandex') && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#FF0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onViewReports(project)}
                    className="flex-1 bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Отчеты
                </button>
                
                <button
                    onClick={() => onAddKeywords(project)}
                    className="bg-accent-purple text-white px-4 py-2 rounded-lg hover:bg-accent-purple/90 transition-colors flex items-center gap-2"
                    title="Добавить ключевые слова"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                
                <button
                    onClick={() => onTrackPositions(project)}
                    className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/90 transition-colors flex items-center gap-2"
                    title="Запустить отслеживание"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
