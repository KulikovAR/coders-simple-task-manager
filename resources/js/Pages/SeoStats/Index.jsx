import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SeoStatsIndex({ auth, sites = [], keywords = [], positions = [] }) {
    const [selectedSite, setSelectedSite] = useState(null);
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [showAddKeywordModal, setShowAddKeywordModal] = useState(false);
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [dateRange, setDateRange] = useState('7'); // 7, 30, 90 дней

    const { data: siteData, setData: setSiteData, post: postSite, processing: siteProcessing, errors: siteErrors } = useForm({
        domain: '',
        name: '',
    });

    const { data: keywordData, setData: setKeywordData, post: postKeyword, processing: keywordProcessing, errors: keywordErrors } = useForm({
        site_id: '',
        value: '',
    });

    const { data: trackData, setData: setTrackData, post: postTrack, processing: trackProcessing, errors: trackErrors } = useForm({
        site_id: '',
        device: 'desktop',
        country: '',
        lang: '',
        os: '',
        ads: false,
    });

    const handleAddSite = (e) => {
        e.preventDefault();
        postSite(route('seo-stats.store-site'), {
            onSuccess: () => {
                setShowAddSiteModal(false);
                setSiteData({ domain: '', name: '' });
            },
        });
    };

    const handleAddKeyword = (e) => {
        e.preventDefault();
        postKeyword(route('seo-stats.store-keyword'), {
            onSuccess: () => {
                setShowAddKeywordModal(false);
                setKeywordData({ site_id: '', value: '' });
            },
        });
    };

    const handleTrackPositions = (e) => {
        e.preventDefault();
        setIsTracking(true);
        setShowTrackModal(false);
        
        postTrack(route('seo-stats.track-positions'), {
            onSuccess: () => {
                setTrackData({ site_id: '', device: 'desktop', country: '', lang: '', os: '', ads: false });
                setTimeout(() => setIsTracking(false), 2000); // Показываем прелоадер 2 секунды
            },
            onError: () => {
                setIsTracking(false);
            },
        });
    };

    const handleDeleteKeyword = (siteId, keywordId) => {
        if (confirm('Вы уверены, что хотите удалить это ключевое слово?')) {
            router.delete(route('seo-stats.destroy-keyword', keywordId), {
                data: { site_id: siteId },
            });
        }
    };

    const getKeywordsBySite = (siteId) => {
        return keywords.filter(kw => kw.site_id === siteId);
    };

    const getPositionsForSite = (siteId) => {
        return positions.filter(pos => pos.site_id === siteId);
    };

    const getUniqueDates = (siteId) => {
        const sitePositions = getPositionsForSite(siteId);
        const uniqueDates = new Set();
        
        sitePositions.forEach(pos => {
            if (pos.date) {
                // Берем только дату без времени
                const dateOnly = pos.date.split('T')[0];
                uniqueDates.add(dateOnly);
            }
        });
        
        return Array.from(uniqueDates)
            .sort()
            .slice(-parseInt(dateRange));
    };

    const getPositionForKeyword = (keywordId, date, siteId) => {
        const position = positions.find(pos => {
            const posDateOnly = pos.date ? pos.date.split('T')[0] : '';
            return pos.keyword_id === keywordId && posDateOnly === date && pos.site_id === siteId;
        });
        return position ? position.rank : '-';
    };

    const getPositionChange = (keywordId, date, siteId) => {
        const dates = getUniqueDates(siteId);
        const currentIndex = dates.indexOf(date);
        if (currentIndex <= 0) return null;
        
        const currentPosition = getPositionForKeyword(keywordId, date, siteId);
        const previousPosition = getPositionForKeyword(keywordId, dates[currentIndex - 1], siteId);
        
        if (currentPosition === '-' || previousPosition === '-') return null;
        
        const change = previousPosition - currentPosition;
        return change;
    };

    const selectedSiteData = selectedSite ? sites.find(s => s.id === selectedSite) : null;
    const selectedSiteKeywords = selectedSite ? getKeywordsBySite(selectedSite) : [];
    const selectedSiteDates = selectedSite ? getUniqueDates(selectedSite) : [];


    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="SEO Статистика" />

            <div className="flex h-screen bg-primary-bg p-4 gap-4">
                {/* Боковая панель */}
                <div className="w-80 bg-card-bg border border-border-color flex flex-col rounded-xl shadow-sm">
                    <div className="p-6 border-b border-border-color">
                        <h2 className="text-xl font-semibold text-text-primary mb-4">SEO Статистика</h2>
                        <button
                            onClick={() => setShowAddSiteModal(true)}
                            className="w-full bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Добавить сайт
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {sites.length === 0 ? (
                            <div className="p-6 text-center">
                                <div className="text-text-muted mb-4">
                                    <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-text-muted text-sm">Нет сайтов для отслеживания</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-2">
                                {sites.map((site) => (
                                    <div
                                        key={site.id}
                                        onClick={() => setSelectedSite(site.id)}
                                        className={`p-4 rounded-lg cursor-pointer transition-colors duration-150 ${
                                            selectedSite === site.id
                                                ? 'bg-accent-blue/20 border border-accent-blue/30 text-accent-blue'
                                                : 'bg-secondary-bg hover:bg-secondary-bg/80 text-text-primary'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium truncate">{site.name}</h3>
                                            <span className="text-xs text-text-muted">
                                                {getKeywordsBySite(site.id).length} ключевых слов
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted truncate">{site.domain}</p>
                                        <div className="flex gap-1 mt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTrackData({ ...trackData, site_id: site.id });
                                                    setShowTrackModal(true);
                                                }}
                                                className="text-xs bg-accent-green/20 text-accent-green px-2 py-1 rounded hover:bg-accent-green/30 transition-colors"
                                            >
                                                Отслеживать
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setKeywordData({ ...keywordData, site_id: site.id });
                                                    setShowAddKeywordModal(true);
                                                }}
                                                className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded hover:bg-accent-purple/30 transition-colors"
                                            >
                                                + Ключевое слово
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Основная область */}
                <div className="flex-1 flex flex-col bg-card-bg rounded-xl border border-border-color shadow-sm">
                    {isTracking ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mx-auto mb-4"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-accent-blue animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">Запуск отслеживания позиций</h3>
                                <p className="text-text-muted">Пожалуйста, подождите...</p>
                            </div>
                        </div>
                    ) : selectedSiteData ? (
                        <>
                            {/* Заголовок и фильтры */}
                            <div className="border-b border-border-color p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-text-primary">{selectedSiteData.name}</h1>
                                        <p className="text-text-muted">{selectedSiteData.domain}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        >
                                            <option value="7">7 дней</option>
                                            <option value="30">30 дней</option>
                                            <option value="90">90 дней</option>
                                        </select>
                                        <button
                                            onClick={() => {
                                                setTrackData({ ...trackData, site_id: selectedSiteData.id });
                                                setShowTrackModal(true);
                                            }}
                                            className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/90 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Запустить отслеживание
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Таблица */}
                            <div className="flex-1 overflow-auto">
                                {selectedSiteKeywords.length > 0 ? (
                                    <div className="p-6">
                                        <div className="bg-card-bg rounded-xl border border-border-color overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead className="bg-secondary-bg">
                                                        <tr>
                                                            <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                                                                Ключевое слово
                                                            </th>
                                                            {selectedSiteDates.map((date, index) => (
                                                                <th key={`${date}-${index}`} className="px-4 py-4 text-center text-sm font-medium text-text-primary min-w-[100px]">
                                                                    <div className="flex flex-col">
                                                                        <span>{new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                                                                        <span className="text-xs text-text-muted">{new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                                                                    </div>
                                                                </th>
                                                            ))}
                                                            <th className="px-6 py-4 text-center text-sm font-medium text-text-primary">
                                                                Действия
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-color">
                                                        {selectedSiteKeywords.map((keyword) => (
                                                            <tr key={keyword.id} className="hover:bg-secondary-bg/50 transition-colors duration-150">
                                                                <td className="px-6 py-4 text-text-primary font-medium">
                                                                    {keyword.value}
                                                                </td>
                                                                {selectedSiteDates.map((date, index) => {
                                                                    const position = getPositionForKeyword(keyword.id, date, selectedSiteData.id);
                                                                    const change = getPositionChange(keyword.id, date, selectedSiteData.id);
                                                                    return (
                                                                        <td key={`${date}-${keyword.id}-${index}`} className="px-4 py-4 text-center">
                                                                            <div className="flex flex-col items-center">
                                                                                <span className={`text-sm font-medium ${
                                                                                    position === '-' ? 'text-text-muted' : 
                                                                                    position <= 3 ? 'text-green-400' :
                                                                                    position <= 10 ? 'text-yellow-400' :
                                                                                    'text-red-400'
                                                                                }`}>
                                                                                    {position}
                                                                                </span>
                                                                                {change !== null && (
                                                                                    <span className={`text-xs ${
                                                                                        change > 0 ? 'text-green-400' : 
                                                                                        change < 0 ? 'text-red-400' : 
                                                                                        'text-text-muted'
                                                                                    }`}>
                                                                                        {change > 0 ? '↑' : change < 0 ? '↓' : '='} {Math.abs(change)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                                <td className="px-6 py-4 text-center">
                                                                    <button
                                                                        onClick={() => handleDeleteKeyword(selectedSiteData.id, keyword.id)}
                                                                        className="text-accent-red hover:text-accent-red/80 transition-colors p-1"
                                                                        title="Удалить ключевое слово"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-text-muted mb-4">
                                                <svg className="mx-auto h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-text-primary mb-2">Нет ключевых слов</h3>
                                            <p className="text-text-muted mb-4">Добавьте ключевые слова для отслеживания позиций</p>
                                            <button
                                                onClick={() => {
                                                    setKeywordData({ ...keywordData, site_id: selectedSiteData.id });
                                                    setShowAddKeywordModal(true);
                                                }}
                                                className="bg-accent-purple text-white px-4 py-2 rounded-lg hover:bg-accent-purple/90 transition-colors"
                                            >
                                                Добавить первое ключевое слово
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-text-muted mb-4">
                                    <svg className="mx-auto h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-text-primary mb-2">Выберите сайт</h3>
                                <p className="text-text-muted">Выберите сайт из списка слева для просмотра статистики</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальные окна остаются без изменений */}
            {showAddSiteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-border-color rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Добавить сайт</h3>
                        <form onSubmit={handleAddSite}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        Название сайта
                                    </label>
                                    <input
                                        type="text"
                                        value={siteData.name}
                                        onChange={(e) => setSiteData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        required
                                    />
                                    {siteErrors.name && <p className="text-accent-red text-sm mt-1">{siteErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        Домен
                                    </label>
                                    <input
                                        type="text"
                                        value={siteData.domain}
                                        onChange={(e) => setSiteData('domain', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        placeholder="example.com"
                                        required
                                    />
                                    {siteErrors.domain && <p className="text-accent-red text-sm mt-1">{siteErrors.domain}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddSiteModal(false)}
                                    className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={siteProcessing}
                                    className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
                                >
                                    {siteProcessing ? 'Добавление...' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddKeywordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-border-color rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Добавить ключевое слово</h3>
                        <form onSubmit={handleAddKeyword}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        Сайт
                                    </label>
                                    <select
                                        value={keywordData.site_id}
                                        onChange={(e) => setKeywordData('site_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        required
                                    >
                                        <option value="">Выберите сайт</option>
                                        {sites.map((site) => (
                                            <option key={site.id} value={site.id}>
                                                {site.name} ({site.domain})
                                            </option>
                                        ))}
                                    </select>
                                    {keywordErrors.site_id && <p className="text-accent-red text-sm mt-1">{keywordErrors.site_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        Ключевое слово
                                    </label>
                                    <input
                                        type="text"
                                        value={keywordData.value}
                                        onChange={(e) => setKeywordData('value', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        required
                                    />
                                    {keywordErrors.value && <p className="text-accent-red text-sm mt-1">{keywordErrors.value}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddKeywordModal(false)}
                                    className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={keywordProcessing}
                                    className="bg-accent-purple text-white px-4 py-2 rounded-lg hover:bg-accent-purple/90 transition-colors disabled:opacity-50"
                                >
                                    {keywordProcessing ? 'Добавление...' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTrackModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-border-color rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Отслеживание позиций</h3>
                        <form onSubmit={handleTrackPositions}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        Устройство
                                    </label>
                                    <select
                                        value={trackData.device}
                                        onChange={(e) => setTrackData('device', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        required
                                    >
                                        <option value="desktop">Desktop</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="mobile">Mobile</option>
                                    </select>
                                    {trackErrors.device && <p className="text-accent-red text-sm mt-1">{trackErrors.device}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        Страна (код)
                                    </label>
                                    <input
                                        type="text"
                                        value={trackData.country}
                                        onChange={(e) => setTrackData('country', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        placeholder="ru"
                                    />
                                    {trackErrors.country && <p className="text-accent-red text-sm mt-1">{trackErrors.country}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        Язык (код)
                                    </label>
                                    <input
                                        type="text"
                                        value={trackData.lang}
                                        onChange={(e) => setTrackData('lang', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                        placeholder="ru"
                                    />
                                    {trackErrors.lang && <p className="text-accent-red text-sm mt-1">{trackErrors.lang}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">
                                        ОС (для мобильных)
                                    </label>
                                    <select
                                        value={trackData.os}
                                        onChange={(e) => setTrackData('os', e.target.value)}
                                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                    >
                                        <option value="">Не выбрано</option>
                                        <option value="ios">iOS</option>
                                        <option value="android">Android</option>
                                    </select>
                                    {trackErrors.os && <p className="text-accent-red text-sm mt-1">{trackErrors.os}</p>}
                                </div>
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={trackData.ads}
                                            onChange={(e) => setTrackData('ads', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-text-primary">Включая рекламу</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTrackModal(false)}
                                    className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={trackProcessing}
                                    className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/90 transition-colors disabled:opacity-50"
                                >
                                    {trackProcessing ? 'Запуск...' : 'Запустить отслеживание'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}