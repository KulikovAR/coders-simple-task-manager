import { useState } from 'react';
import axios from 'axios';

export default function PageSpeedCard({ siteId, domain }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('mobile');

    const loadPageSpeedData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(route('seo-stats.pagespeed', siteId));
            
            if (response.data.success) {
                setData(response.data);
            } else {
                setError('Не удалось загрузить данные');
            }
        } catch (err) {
            console.error('PageSpeed error:', err);
            setError('Ошибка загрузки данных PageSpeed');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (score) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatMetric = (value, unit = 'ms') => {
        if (value === null || value === undefined) return '-';
        return `${value} ${unit}`;
    };

    const currentData = data?.[activeTab];

    if (!data && !loading && !error) {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-text-primary">PageSpeed Insights</h3>
                    </div>
                    <button
                        onClick={loadPageSpeedData}
                        disabled={loading}
                        className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Загрузка...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Загрузить данные PageSpeed
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-muted">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-sm">Загрузка данных PageSpeed... Это может занять до 2 минут</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{error}</span>
                    </div>
                    <button
                        onClick={loadPageSpeedData}
                        disabled={loading}
                        className="text-xs text-accent-blue hover:text-accent-blue/80 disabled:opacity-50"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    if (!data || !currentData) {
        return null;
    }

    return (
        <div className="bg-card-bg border border-border-color rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-text-primary">PageSpeed Insights</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-secondary-bg rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('mobile')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                activeTab === 'mobile'
                                    ? 'bg-accent-blue text-white'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                            Mobile
                        </button>
                        <button
                            onClick={() => setActiveTab('desktop')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                activeTab === 'desktop'
                                    ? 'bg-accent-blue text-white'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                            Desktop
                        </button>
                    </div>
                    <button
                        onClick={loadPageSpeedData}
                        disabled={loading}
                        className="p-1.5 text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Обновить данные"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {currentData && (
                <div className="space-y-3">
                    {/* Основные оценки */}
                    <div className="grid grid-cols-4 gap-2">
                        {currentData.scores?.performance !== null && (
                            <div className="text-center">
                                <div className={`text-lg font-bold ${getScoreColor(currentData.scores.performance)}`}>
                                    {currentData.scores.performance}
                                </div>
                                <div className="text-xs text-text-muted">Performance</div>
                            </div>
                        )}
                        {currentData.scores?.accessibility !== null && (
                            <div className="text-center">
                                <div className={`text-lg font-bold ${getScoreColor(currentData.scores.accessibility)}`}>
                                    {currentData.scores.accessibility}
                                </div>
                                <div className="text-xs text-text-muted">Accessibility</div>
                            </div>
                        )}
                        {currentData.scores?.best_practices !== null && (
                            <div className="text-center">
                                <div className={`text-lg font-bold ${getScoreColor(currentData.scores.best_practices)}`}>
                                    {currentData.scores.best_practices}
                                </div>
                                <div className="text-xs text-text-muted">Best Practices</div>
                            </div>
                        )}
                        {currentData.scores?.seo !== null && (
                            <div className="text-center">
                                <div className={`text-lg font-bold ${getScoreColor(currentData.scores.seo)}`}>
                                    {currentData.scores.seo}
                                </div>
                                <div className="text-xs text-text-muted">SEO</div>
                            </div>
                        )}
                    </div>

                    {/* Ключевые метрики */}
                    {currentData.metrics && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {currentData.metrics.first_contentful_paint !== null && (
                                <div className="flex items-center justify-between p-2 bg-secondary-bg rounded">
                                    <span className="text-text-muted">FCP</span>
                                    <span className="text-text-primary font-medium">
                                        {formatMetric(currentData.metrics.first_contentful_paint)}
                                    </span>
                                </div>
                            )}
                            {currentData.metrics.largest_contentful_paint !== null && (
                                <div className="flex items-center justify-between p-2 bg-secondary-bg rounded">
                                    <span className="text-text-muted">LCP</span>
                                    <span className="text-text-primary font-medium">
                                        {formatMetric(currentData.metrics.largest_contentful_paint)}
                                    </span>
                                </div>
                            )}
                            {currentData.metrics.total_blocking_time !== null && (
                                <div className="flex items-center justify-between p-2 bg-secondary-bg rounded">
                                    <span className="text-text-muted">TBT</span>
                                    <span className="text-text-primary font-medium">
                                        {formatMetric(currentData.metrics.total_blocking_time)}
                                    </span>
                                </div>
                            )}
                            {currentData.metrics.cumulative_layout_shift !== null && (
                                <div className="flex items-center justify-between p-2 bg-secondary-bg rounded">
                                    <span className="text-text-muted">CLS</span>
                                    <span className="text-text-primary font-medium">
                                        {currentData.metrics.cumulative_layout_shift.toFixed(3)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Индикатор производительности */}
                    {currentData.scores?.performance !== null && (
                        <div className="pt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-text-muted">Performance Score</span>
                                <span className={`font-semibold ${getScoreColor(currentData.scores.performance)}`}>
                                    {currentData.scores.performance}/100
                                </span>
                            </div>
                            <div className="w-full bg-secondary-bg rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${getScoreBgColor(currentData.scores.performance)}`}
                                    style={{ width: `${currentData.scores.performance}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loading && data && (
                <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Обновление...
                </div>
            )}
        </div>
    );
}

