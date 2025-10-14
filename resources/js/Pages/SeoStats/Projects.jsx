import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import CreateSiteModal from '@/Components/SeoStats/CreateSiteModal';
import ProjectCard from '@/Components/SeoStats/ProjectCard';

export default function SeoStatsIndex({ auth, sites = [], keywords = [] }) {
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);

    const handleViewReports = (project) => {
        router.visit(route('seo-stats.reports', project.id));
    };

    const handleAddKeywords = (project) => {
        // TODO: Реализовать модальное окно для добавления ключевых слов
        console.log('Add keywords for project:', project);
    };

    const handleTrackPositions = (project) => {
        // TODO: Реализовать запуск отслеживания позиций
        console.log('Track positions for project:', project);
    };

    return (
        <SeoLayout user={auth.user}>
            <Head title="SEO Проекты" />

            <div className="min-h-screen bg-primary-bg p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Заголовок и кнопка создания */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">SEO Проекты</h1>
                            <p className="text-text-muted">Управляйте своими SEO проектами и отслеживайте позиции</p>
                        </div>
                        
                        <button
                            onClick={() => setShowAddSiteModal(true)}
                            className="bg-accent-blue text-white px-6 py-3 rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Создать проект
                        </button>
                    </div>

                    {/* Список проектов */}
                    {sites.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-text-muted mb-6">
                                <svg className="mx-auto h-20 w-20 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-text-primary mb-4">Нет проектов</h3>
                            <p className="text-text-muted mb-6 max-w-md mx-auto">
                                Создайте свой первый SEO проект для отслеживания позиций в поисковых системах
                            </p>
                            <button
                                onClick={() => setShowAddSiteModal(true)}
                                className="bg-accent-blue text-white px-8 py-3 rounded-lg hover:bg-accent-blue/90 transition-colors font-medium"
                            >
                                Создать первый проект
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sites.map((site) => (
                                <ProjectCard
                                    key={site.id}
                                    project={site}
                                    keywords={keywords}
                                    onViewReports={handleViewReports}
                                    onAddKeywords={handleAddKeywords}
                                    onTrackPositions={handleTrackPositions}
                                />
                            ))}
                        </div>
                    )}

                    {/* Статистика */}
                    {sites.length > 0 && (
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card-bg border border-border-color rounded-xl p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-accent-blue/10 rounded-lg">
                                        <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text-primary">{sites.length}</p>
                                        <p className="text-text-muted text-sm">Проектов</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card-bg border border-border-color rounded-xl p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-accent-purple/10 rounded-lg">
                                        <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text-primary">
                                            {keywords.reduce((total, kw) => total + 1, 0)}
                                        </p>
                                        <p className="text-text-muted text-sm">Ключевых слов</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card-bg border border-border-color rounded-xl p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-accent-green/10 rounded-lg">
                                        <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text-primary">
                                            {sites.reduce((total, site) => total + (site.search_engines?.length || 0), 0)}
                                        </p>
                                        <p className="text-text-muted text-sm">Поисковых систем</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно создания проекта */}
            <CreateSiteModal
                showModal={showAddSiteModal}
                onClose={() => setShowAddSiteModal(false)}
                siteData={{
                    domain: '',
                    name: '',
                    keywords: '',
                    search_engines: [],
                    regions: {},
                }}
                setSiteData={(field, value) => {
                    // Простая реализация для демонстрации
                    console.log('Set data:', field, value);
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    // TODO: Реализовать отправку формы
                    console.log('Submit form');
                }}
                processing={false}
                errors={{}}
            />
        </SeoLayout>
    );
}
