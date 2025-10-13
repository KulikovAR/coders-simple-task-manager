import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SeoReports({ auth, project, keywords = [], positions = [] }) {
    const [dateRange, setDateRange] = useState('7'); // 7, 30, 90 дней
    const [isTracking, setIsTracking] = useState(false);

    const { data: trackData, setData: setTrackData, post: postTrack, processing: trackProcessing, errors: trackErrors } = useForm({
        site_id: project.id,
        device: 'desktop',
        country: '',
        lang: '',
        os: '',
        ads: false,
    });

    const handleTrackPositions = (e) => {
        e.preventDefault();
        setIsTracking(true);
        
        postTrack(route('seo-stats.track-positions'), {
            onSuccess: () => {
                setTrackData({ site_id: project.id, device: 'desktop', country: '', lang: '', os: '', ads: false });
                setTimeout(() => setIsTracking(false), 2000);
            },
            onError: () => {
                setIsTracking(false);
            },
        });
    };

    const handleDeleteKeyword = (keywordId) => {
        if (confirm('Вы уверены, что хотите удалить это ключевое слово?')) {
            router.delete(route('seo-stats.destroy-keyword', keywordId), {
                data: { site_id: project.id },
            });
        }
    };

    const getUniqueDates = () => {
        const uniqueDates = new Set();
        
        positions.forEach(pos => {
            if (pos.date) {
                const dateOnly = pos.date.split('T')[0];
                uniqueDates.add(dateOnly);
            }
        });
        
        return Array.from(uniqueDates)
            .sort()
            .slice(-parseInt(dateRange));
    };

    const getPositionForKeyword = (keywordId, date) => {
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
        <AuthenticatedLayout user={auth.user}>
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
                                        setTrackData({ ...trackData, site_id: project.id });
                                        // TODO: Показать модальное окно отслеживания
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

                    {/* Таблица позиций */}
                    {isTracking ? (
                        <div className="bg-card-bg border border-border-color rounded-xl p-12 text-center">
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
                    ) : keywords.length > 0 ? (
                        <div className="bg-card-bg border border-border-color rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-secondary-bg">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                                                Ключевое слово
                                            </th>
                                            {uniqueDates.map((date, index) => (
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
                                        {keywords.map((keyword) => (
                                            <tr key={keyword.id} className="hover:bg-secondary-bg/50 transition-colors duration-150">
                                                <td className="px-6 py-4 text-text-primary font-medium">
                                                    {keyword.value}
                                                </td>
                                                {uniqueDates.map((date, index) => {
                                                    const position = getPositionForKeyword(keyword.id, date);
                                                    const change = getPositionChange(keyword.id, date);
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
                                                        onClick={() => handleDeleteKeyword(keyword.id)}
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
                    ) : (
                        <div className="bg-card-bg border border-border-color rounded-xl p-12 text-center">
                            <div className="text-text-muted mb-4">
                                <svg className="mx-auto h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-text-primary mb-2">Нет ключевых слов</h3>
                            <p className="text-text-muted mb-4">Добавьте ключевые слова для отслеживания позиций</p>
                            <button
                                onClick={() => {
                                    // TODO: Показать модальное окно добавления ключевых слов
                                }}
                                className="bg-accent-purple text-white px-4 py-2 rounded-lg hover:bg-accent-purple/90 transition-colors"
                            >
                                Добавить первое ключевое слово
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
