import { Head, router } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import PositionFilters from '@/Components/SeoStats/PositionFilters';
import PositionsTable from '@/Components/SeoStats/PositionsTable';
import StatsSection from '@/Components/SeoStats/StatsSection';
import RecognitionStatus from '@/Components/SeoStats/RecognitionStatus';
import TrackPositionsButton from '@/Components/SeoStats/TrackPositionsButton';
import TrackWordstatButton from '@/Components/SeoStats/TrackWordstatButton';
import { useSeoRecognition } from '@/hooks/useSeoRecognition';
import { useState } from 'react';
import axios from 'axios';

export default function SeoReports({ 
    auth, 
    project, 
    keywords = [], 
    positions = [], 
    statistics = {},
    filters = {},
    filterOptions = {},
    pagination = {},
    activeTask = null,
    groups = [],
    targets = [],
    public_token = null
}) {
    const { recognitionStatus } = useSeoRecognition(project.id);
    const [exportProcessing, setExportProcessing] = useState({ html: false, excel: false });
    const [showExportMessage, setShowExportMessage] = useState(null);
    const [publicUrl, setPublicUrl] = useState(public_token ? route('seo-stats.public-reports', public_token) : null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleRefreshData = () => {
        router.reload({ only: ['positions'] });
    };

    const handleGeneratePublicLink = async () => {
        try {
            const response = await axios.post(route('seo-stats.generate-public-token', project.id));
            
            if (response.data.success) {
                setPublicUrl(response.data.url);
                // Копируем в буфер обмена
                await navigator.clipboard.writeText(response.data.url);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
            }
        } catch (error) {
            alert('Ошибка при создании публичной ссылки');
        }
    };

    const handleCopyPublicLink = async () => {
        const url = public_token 
            ? route('seo-stats.public-reports', public_token)
            : publicUrl;
        
        if (url) {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        } else {
            await handleGeneratePublicLink();
        }
    };

    const handleExport = async (type) => {
        setExportProcessing(prev => ({ ...prev, [type]: true }));
        
        try {
            const exportFilters = {
                ...(filters.source && { source: filters.source }),
                ...(filters.group_id && { group_id: filters.group_id }),
                ...(filters.wordstat_query_type && { wordstat_query_type: filters.wordstat_query_type }),
                ...(filters.date_from && { date_from: filters.date_from }),
                ...(filters.date_to && { date_to: filters.date_to }),
                ...(filters.rank_from !== undefined && filters.rank_from !== null && filters.rank_from !== '' && { rank_from: filters.rank_from }),
                ...(filters.rank_to !== undefined && filters.rank_to !== null && filters.rank_to !== '' && { rank_to: filters.rank_to }),
                ...(filters.date_sort && { date_sort: filters.date_sort }),
                ...(filters.sort_type && { sort_type: filters.sort_type }),
                ...(filters.wordstat_sort && { wordstat_sort: filters.wordstat_sort }),
            };
            
            const response = await axios.post(route('reports.export'), {
                site_id: project.id,
                type: type,
                filters: exportFilters
            });
            
            setShowExportMessage({
                type: 'success',
                text: `Отчет ${type.toUpperCase()} создается в фоновом режиме. Он будет доступен на странице отчетов.`
            });
            
            setTimeout(() => setShowExportMessage(null), 5000);
        } catch (error) {
            setShowExportMessage({
                type: 'error',
                text: 'Ошибка при создании отчета. Попробуйте еще раз.'
            });
            
            setTimeout(() => setShowExportMessage(null), 5000);
        } finally {
            setExportProcessing(prev => ({ ...prev, [type]: false }));
        }
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
                        groups={groups || []}
                        targets={targets || []}
                    />

                    {/* Экспорт отчетов */}
                    <div className="bg-card-bg border border-border-color rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-text-primary mb-2">Экспорт отчетов</h2>
                                <p className="text-text-muted">Создайте отчеты в различных форматах</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCopyPublicLink}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                                    title={copySuccess ? 'Скопировано!' : 'Скопировать публичную ссылку'}
                                >
                                    {copySuccess ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Скопировано!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Публичная ссылка
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => handleExport('html')}
                                    disabled={exportProcessing.html}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportProcessing.html ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    )}
                                    {exportProcessing.html ? 'Создание...' : 'HTML'}
                                </button>
                                
                                <button
                                    onClick={() => handleExport('excel')}
                                    disabled={exportProcessing.excel}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportProcessing.excel ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                    {exportProcessing.excel ? 'Создание...' : 'Excel'}
                                </button>
                            </div>
                        </div>
                        
                        {/* Сообщение о создании отчета */}
                        {showExportMessage && (
                            <div className={`mt-4 p-4 rounded-lg border ${
                                showExportMessage.type === 'success' 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {showExportMessage.type === 'success' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <span className="font-medium">{showExportMessage.text}</span>
                                </div>
                                <div className="mt-2 text-sm">
                                    <a 
                                        href={route('reports.index')} 
                                        className="underline hover:no-underline"
                                    >
                                        Перейти к отчетам →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

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
                            
                            <div className="flex flex-col gap-3 items-end">
                                <div className="flex items-center gap-4">
                                    <TrackPositionsButton siteId={project.id} initialData={activeTask} />
                                    {project.wordstat_enabled && (
                                        <TrackWordstatButton siteId={project.id} initialData={activeTask} />
                                    )}
                                </div>
                                {project.last_position_update && (
                                    <div className="text-xs text-text-muted flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Последнее обновление: {new Date(project.last_position_update).toLocaleString('ru-RU')}
                                    </div>
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
                        projectId={project.id}
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
