import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import CreateSiteModal from '@/Components/SeoStats/CreateSiteModal';
import EditProjectModal from '@/Components/SeoStats/EditProjectModal';
import ProjectTableRow from '@/Components/SeoStats/ProjectTableRow';
import ProjectLoadingOverlay from '@/Components/SeoStats/ProjectLoadingOverlay';

export default function SeoStatsIndex({ auth, sites = [], activeTasks = {} }) {
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isLoadingProjectData, setIsLoadingProjectData] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: siteData, setData: setSiteData, post: postSite, processing: siteProcessing, errors: siteErrors } = useForm({
        domain: '',
        name: '',
        keyword_groups: [],
        search_engines: [],
        targets: [],
        position_limit_yandex: 10,
        position_limit_google: 10,
        subdomains: false,
        schedule: null,
        wordstat_enabled: false,
        wordstat_region: null,
        wordstat_options: { default: true },
    });

    const { data: editData, setData: setEditData, put: putSite, processing: editProcessing, errors: editErrors } = useForm({
        domain: '',
        name: '',
        keyword_groups: [],
        search_engines: [],
        targets: [],
        position_limit_yandex: 10,
        position_limit_google: 10,
        subdomains: false,
        schedule: null,
        wordstat_enabled: false,
        wordstat_region: null,
        wordstat_options: { default: true },
    });

    const handleViewReports = (project) => {
        router.visit(route('seo-stats.reports', project.id));
    };

    const handleEditProject = async (project) => {
        setEditingProject(project);
        setIsLoadingProjectData(true);
        
        setEditData({ 
            domain: '', 
            name: '', 
            keyword_groups: [], 
            search_engines: [], 
            targets: [], 
            position_limit_yandex: 10,
            position_limit_google: 10,
            subdomains: false, 
            schedule: null, 
            wordstat_enabled: false, 
            wordstat_region: null,
            wordstat_options: { default: true }
        });
        
        try {
            const url = route('seo-stats.project-data', project.id);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                const editFormData = {
                    domain: data.site.domain || '',
                    name: data.site.name || '',
                    keyword_groups: data.keyword_groups || [],
                    search_engines: data.site.search_engines || [],
                    targets: data.site.targets || [],
                    position_limit_yandex: data.site.position_limit_yandex || 10,
                    position_limit_google: data.site.position_limit_google || 10,
                    subdomains: data.site.subdomains || false,
                    schedule: data.site.schedule || null,
                    wordstat_enabled: data.site.wordstat_enabled || false,
                    wordstat_region: data.site.wordstat_region || null,
                    wordstat_options: data.site.wordstat_options || { default: true },
                };
                
                setEditData(editFormData);
            } else {
                console.error('Ошибка загрузки данных проекта:', data.error);
                const fallbackData = {
                    domain: project.domain || '',
                    name: project.name || '',
                    keyword_groups: [],
                    search_engines: project.search_engines || [],
                    targets: [],
                    position_limit_yandex: project.position_limit_yandex || 10,
                    position_limit_google: project.position_limit_google || 10,
                    subdomains: project.subdomains || false,
                    schedule: project.schedule || null,
                    wordstat_enabled: project.wordstat_enabled || false,
                    wordstat_region: project.wordstat_region || null,
                    wordstat_options: project.wordstat_options || { default: true },
                };
                setEditData(fallbackData);
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных проекта:', error);
            const fallbackData = {
                domain: project.domain || '',
                name: project.name || '',
                keyword_groups: [],
                search_engines: project.search_engines || [],
                targets: [],
                position_limit_yandex: project.position_limit_yandex || 10,
                position_limit_google: project.position_limit_google || 10,
                subdomains: project.subdomains || false,
                schedule: project.schedule || null,
                wordstat_enabled: project.wordstat_enabled || false,
                wordstat_region: project.wordstat_region || null,
            };
            setEditData(fallbackData);
        } finally {
            setIsLoadingProjectData(false);
            setShowEditModal(true);
        }
    };

    const handleAddSite = (e) => {
        e.preventDefault();
        postSite(route('seo-stats.store-site'), {
            onSuccess: () => {
                setShowAddSiteModal(false);
                setSiteData({ domain: '', name: '', keyword_groups: [], search_engines: [], targets: [], position_limit_yandex: 10, position_limit_google: 10, subdomains: false, schedule: null, wordstat_enabled: false, wordstat_region: null, wordstat_options: { default: true } });
            },
        });
    };

    const handleUpdateSite = (e) => {
        e.preventDefault();
        console.log('Updating site with data:', editData);
        console.log('Editing project ID:', editingProject?.id);
        
        putSite(route('seo-stats.update-site', editingProject.id), {
            onSuccess: () => {
                console.log('Site updated successfully');
                setShowEditModal(false);
                setEditingProject(null);
                setEditData({ domain: '', name: '', keyword_groups: [], search_engines: [], targets: [], position_limit_yandex: 10, position_limit_google: 10, subdomains: false, schedule: null, wordstat_enabled: false, wordstat_region: null, wordstat_options: { default: true } });
            },
            onError: (errors) => {
                console.error('Error updating site:', errors);
            }
        });
    };

    const filteredSites = sites.filter(site => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            site.name?.toLowerCase().includes(searchLower) ||
            site.domain?.toLowerCase().includes(searchLower)
        );
    });


    return (
        <SeoLayout user={auth.user}>
            <Head title="SEO Проекты" />

            <div className="min-h-screen bg-primary-bg p-6">
                {/* Прелоадер для загрузки данных проекта */}
                <ProjectLoadingOverlay 
                    isVisible={isLoadingProjectData}
                    title="Загрузка данных проекта"
                    subtitle="Пожалуйста, подождите..."
                />
                
                <div className="max-w-7xl mx-auto">
                    {/* Заголовок и кнопки */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">SEO Проекты</h1>
                            <p className="text-text-muted">Управляйте своими SEO проектами и отслеживайте позиции</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.visit(route('reports.index'))}
                                className="bg-secondary-bg text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center gap-2 text-sm font-medium border border-border-color"
                                title="Перейти к отчетам"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Отчеты
                            </button>
                            
                            <button
                                onClick={() => setShowAddSiteModal(true)}
                                className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center gap-2 text-sm font-medium"
                                title="Создать новый SEO проект"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Создать проект
                            </button>
                        </div>
                    </div>

                    {/* Поиск по проектам */}
                    {sites.length > 0 && (
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Поиск по названию или домену..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                        title="Очистить поиск"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {searchTerm && (
                                <p className="mt-2 text-sm text-text-muted">
                                    Найдено проектов: {filteredSites.length} из {sites.length}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Таблица проектов */}
                    {filteredSites.length === 0 && sites.length > 0 ? (
                        <div className="text-center py-16">
                            <div className="text-text-muted mb-4">
                                <svg className="mx-auto h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-text-primary mb-2">Ничего не найдено</h3>
                            <p className="text-text-muted mb-4">
                                По запросу "{searchTerm}" проектов не найдено
                            </p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-accent-blue hover:text-accent-blue/80 transition-colors text-sm font-medium"
                            >
                                Очистить поиск
                            </button>
                        </div>
                    ) : sites.length === 0 ? (
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
                                        className="bg-accent-blue text-white px-6 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors font-medium"
                                    >
                                        Создать первый проект
                                    </button>
                        </div>
                    ) : (
                        <div className="bg-card-bg border border-border-color rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border-color">
                                    <thead className="bg-secondary-bg">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Проект
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Поисковые системы
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Ключевые слова
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Динамика
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Последнее обновление
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card-bg divide-y divide-border-color">
                                        {filteredSites.map((site) => (
                                            <ProjectTableRow
                                                key={site.id}
                                                project={site}
                                                onViewReports={handleViewReports}
                                                onEditProject={handleEditProject}
                                                isEditingProject={isLoadingProjectData && editingProject?.id === site.id}
                                                activeTask={activeTasks[site.id] || null}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Модальное окно создания проекта */}
            <CreateSiteModal
                showModal={showAddSiteModal}
                onClose={() => setShowAddSiteModal(false)}
                siteData={siteData}
                setSiteData={setSiteData}
                onSubmit={handleAddSite}
                processing={siteProcessing}
                errors={siteErrors}
            />

            {/* Модальное окно редактирования проекта */}
            <EditProjectModal
                showModal={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingProject(null);
                    setIsLoadingProjectData(false);
                }}
                project={editingProject}
                siteData={editData}
                setSiteData={setEditData}
                onSubmit={handleUpdateSite}
                processing={editProcessing || isLoadingProjectData}
                errors={editErrors}
            />
        </SeoLayout>
    );
}