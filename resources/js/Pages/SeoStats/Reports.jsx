import { Head, router } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import PositionFilters from '@/Components/SeoStats/PositionFilters';
import PositionsTable from '@/Components/SeoStats/PositionsTable';
import StatsSection from '@/Components/SeoStats/StatsSection';
import RecognitionStatus from '@/Components/SeoStats/RecognitionStatus';
import TrackPositionsButton from '@/Components/SeoStats/TrackPositionsButton';
import TrackWordstatButton from '@/Components/SeoStats/TrackWordstatButton';
import { useSeoRecognition } from '@/hooks/useSeoRecognition';

export default function SeoReports({ 
    auth, 
    project, 
    keywords = [], 
    positions = [], 
    statistics = {},
    filters = {},
    filterOptions = {},
    pagination = {},
    activeTask = null
}) {
    const { recognitionStatus } = useSeoRecognition(project.id);

    const handleRefreshData = () => {
        router.reload({ only: ['positions'] });
    };

    if (!project) {
        return (
            <SeoLayout user={auth.user}>
                <Head title="Ошибка" />
                <div className="min-h-screen bg-primary-bg p-6 flex items-center justify-center">
                    <div className="bg-card-bg border border-border-color rounded-xl p-8 text-center">
                        <h2 className="text-xl font-semibold text-text-primary mb-2">Проект не найден</h2>
                        <p className="text-text-muted mb-4">Запрашиваемый проект не существует или у вас нет к нему доступа</p>
                        <button
                            onClick={() => router.visit(route('seo-stats.index'))}
                            className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors"
                        >
                            Вернуться к списку проектов
                        </button>
                    </div>
                </div>
            </SeoLayout>
        );
    }

    const handleDeleteKeyword = (keywordId) => {
        if (confirm('Вы уверены, что хотите удалить это ключевое слово?')) {
            router.delete(route('seo-stats.destroy-keyword', keywordId), {
                data: { site_id: project.id },
            });
        }
    };

    const getUniqueDates = () => {
        const uniqueDates = new Set();
        
        if (Array.isArray(positions)) {
            positions.forEach(pos => {
                if (pos.date) {
                    const dateOnly = pos.date.split('T')[0];
                    uniqueDates.add(dateOnly);
                }
            });
        }
        
        const sortedDates = Array.from(uniqueDates).sort();
        const today = new Date().toISOString().split('T')[0];
        
        if (sortedDates.includes(today)) {
            return [today, ...sortedDates.filter(date => date !== today)];
        }
        
        return sortedDates;
    };

    const getPositionForKeyword = (keywordId, date) => {
        if (!Array.isArray(positions)) return '-';
        
        const position = positions.find(pos => {
            const posDateOnly = pos.date ? pos.date.split('T')[0] : '';
            return pos.keyword_id === keywordId && posDateOnly === date;
        });
        return position ? position.rank : '-';
    };

    const getPositionChange = (keywordId, date) => {
        const dates = getUniqueDates();
        const currentIndex = dates.indexOf(date);
        if (currentIndex <= 0) return null;
        
        const currentPosition = getPositionForKeyword(keywordId, date);
        const previousPosition = getPositionForKeyword(keywordId, dates[currentIndex - 1]);
        
        if (currentPosition === '-' || previousPosition === '-') return null;
        
        const change = previousPosition - currentPosition;
        return change;
    };

    const uniqueDates = getUniqueDates();

    return (
        <SeoLayout user={auth.user}>
            <Head title={`Отчеты - ${project.name}`} />

            <div className="min-h-screen bg-primary-bg p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Хлебные крошки */}
                    <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
                        <button
                            onClick={() => router.visit(route('seo-stats.index'))}
                            className="hover:text-text-primary transition-colors"
                        >
                            SEO Проекты
                        </button>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-text-primary">{project.name}</span>
                    </nav>

                    {/* Фильтры позиций */}
                    <PositionFilters 
                        filters={filters}
                        projectId={project.id}
                        project={project}
                    />

                    {/* Заголовок и фильтры */}
                    <div className="bg-card-bg border border-border-color rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-text-primary mb-2">{project.name}</h1>
                                <p className="text-text-muted">{project.domain}</p>
                                
                                <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {keywords.length} ключевых слов
                                    </div>
                                    
                                    {statistics.total_positions && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            {statistics.total_positions.toLocaleString('ru-RU')} позиций
                                        </div>
                                    )}
                                    
                                    {project.search_engines && project.search_engines.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {project.search_engines.join(', ')}
                                        </div>
                                    )}

                                    {/* Показываем активные фильтры */}
                                    {(filters.date_from || filters.date_to) && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                            </svg>
                                            <span className="text-accent-blue">Фильтры применены</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <TrackPositionsButton siteId={project.id} initialData={activeTask} />
                                {project.wordstat_enabled && (
                                    <TrackWordstatButton siteId={project.id} initialData={activeTask} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Статус распознавания */}
                    <RecognitionStatus 
                        siteId={project.id} 
                        onComplete={handleRefreshData}
                        initialData={activeTask}
                        wordstatEnabled={project.wordstat_enabled}
                    />

                    {/* Статистика позиций */}
                    <StatsSection 
                        keywords={keywords}
                        positions={positions}
                        statistics={statistics}
                        filters={filters}
                    />

                    {/* Таблица позиций */}
                    <PositionsTable
                        keywords={keywords}
                        positions={positions}
                        siteId={project.id}
                        filters={filters}
                        pagination={pagination}
                    />
                </div>
            </div>
        </SeoLayout>
    );
}
