import { Head, router } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import PositionFilters from '@/Components/SeoStats/PositionFilters';
import PositionsTable from '@/Components/SeoStats/PositionsTable';
import StatsSection from '@/Components/SeoStats/StatsSection';
import RecognitionStatus from '@/Components/SeoStats/RecognitionStatus';
import TrackPositionsButton from '@/Components/SeoStats/TrackPositionsButton';
import TrackWordstatButton from '@/Components/SeoStats/TrackWordstatButton';
import PageSpeedCard from '@/Components/SeoStats/PageSpeedCard';
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
            <SeoLayout user={auth.user} disableWaves={false}>
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
        
        // Сортируем от новой к старой (обратный порядок)
        const sortedDates = Array.from(uniqueDates).sort().reverse();
        
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
        // Теперь предыдущая дата справа (индекс +1), так как даты идут от новой к старой
        if (currentIndex < 0 || currentIndex >= dates.length - 1) return null;
        
        const currentPosition = getPositionForKeyword(keywordId, date);
        const previousPosition = getPositionForKeyword(keywordId, dates[currentIndex + 1]);
        
        if (currentPosition === '-' || previousPosition === '-') return null;
        
        const change = previousPosition - currentPosition;
        return change;
    };

    const uniqueDates = getUniqueDates();

    return (
        <SeoLayout user={auth.user} disableWaves={false}>
            <Head title={`Отчеты - ${project.name}`} />

            <div className="min-h-screen bg-primary-bg p-4">
                <div className="max-w-7xl mx-auto space-y-3">
                    {/* Компактный заголовок с информацией о проекте и действиями */}
                    <div className="bg-card-bg border border-border-color rounded-xl p-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            onClick={() => router.visit(route('seo-stats.index'))}
                                            className="text-sm text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            SEO Проекты
                                        </button>
                                        <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <h1 className="text-lg font-bold text-text-primary truncate">{project.name}</h1>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                                        <span className="truncate">{project.domain}</span>
                                        <span>•</span>
                                        <span>{keywords.length} ключ. слов</span>
                                        {statistics.total_positions && (
                                            <>
                                                <span>•</span>
                                                <span>{statistics.total_positions.toLocaleString('ru-RU')} позиций</span>
                                            </>
                                        )}
                                        {project.search_engines && project.search_engines.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{project.search_engines.join(', ')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                                <TrackPositionsButton siteId={project.id} initialData={activeTask} />
                                {project.wordstat_enabled && (
                                    <TrackWordstatButton siteId={project.id} initialData={activeTask} />
                                )}
                                <button
                                    onClick={handleCopyPublicLink}
                                    className="px-3 py-1.5 border border-border-color rounded-lg hover:bg-secondary-bg transition-colors text-xs font-medium flex items-center gap-1.5 text-text-primary"
                                    title={copySuccess ? 'Скопировано!' : 'Публичная ссылка'}
                                >
                                    {copySuccess ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Скопировано
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Публичная
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleExport('html')}
                                    disabled={exportProcessing.html}
                                    className="px-3 py-1.5 border border-border-color rounded-lg hover:bg-secondary-bg transition-colors text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
                                    title="Экспорт HTML"
                                >
                                    {exportProcessing.html ? (
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    )}
                                    HTML
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    disabled={exportProcessing.excel}
                                    className="px-3 py-1.5 border border-border-color rounded-lg hover:bg-secondary-bg transition-colors text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
                                    title="Экспорт Excel"
                                >
                                    {exportProcessing.excel ? (
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                    Excel
                                </button>
                            </div>
                        </div>
                        
                        {/* Сообщение о создании отчета */}
                        {showExportMessage && (
                            <div className={`mt-3 p-3 rounded-lg border text-sm ${
                                showExportMessage.type === 'success' 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {showExportMessage.type === 'success' ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <span className="font-medium">{showExportMessage.text}</span>
                                    <a 
                                        href={route('reports.index')} 
                                        className="ml-auto underline hover:no-underline text-xs"
                                    >
                                        Отчеты →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Фильтры позиций */}
                    <PositionFilters 
                        filters={filters}
                        projectId={project.id}
                        project={project}
                        groups={groups || []}
                        targets={targets || []}
                    />

                    {/* PageSpeed Insights */}
                    {project.domain && (
                        <PageSpeedCard siteId={project.id} domain={project.domain} />
                    )}

                    {/* Статус распознавания */}
                    {/* <RecognitionStatus 
                        siteId={project.id} 
                        onComplete={handleRefreshData}
                        initialData={activeTask}
                        wordstatEnabled={project.wordstat_enabled}
                    /> */}

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
