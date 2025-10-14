import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import CreateSiteModal from '@/Components/SeoStats/CreateSiteModal';
import EditProjectModal from '@/Components/SeoStats/EditProjectModal';
import ProjectTableRow from '@/Components/SeoStats/ProjectTableRow';

export default function SeoStatsIndex({ auth, sites = [], keywords = [] }) {
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const { data: siteData, setData: setSiteData, post: postSite, processing: siteProcessing, errors: siteErrors } = useForm({
        domain: '',
        name: '',
        keywords: '',
        search_engines: [],
        regions: {},
        device_settings: {},
        position_limit: 10,
        subdomains: false,
        schedule: null,
    });

    const { data: editData, setData: setEditData, put: putSite, processing: editProcessing, errors: editErrors } = useForm({
        domain: '',
        name: '',
        keywords: '',
        search_engines: [],
        regions: {},
        device_settings: {},
        position_limit: 10,
        subdomains: false,
        schedule: null,
    });

    const handleViewReports = (project) => {
        router.visit(route('seo-stats.reports', project.id));
    };

    const handleEditProject = async (project) => {
        console.log('Opening edit modal for project:', project);
        setEditingProject(project);
        setShowEditModal(true);
        
        try {
            const url = route('seo-stats.project-data', project.id);
            console.log('Fetching project data from:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Project data response:', { response: response.ok, data });
            
            if (response.ok) {
                const editFormData = {
                    domain: data.site.domain || '',
                    name: data.site.name || '',
                    keywords: data.keywords || '',
                    search_engines: data.site.search_engines || [],
                    regions: data.site.regions || {},
                    device_settings: data.site.device_settings || {},
                    position_limit: data.site.position_limit || 10,
                    subdomains: data.site.subdomains || false,
                    schedule: data.site.schedule || null,
                };
                
                console.log('Setting edit form data:', editFormData);
                setEditData(editFormData);
            } else {
                console.error('Ошибка загрузки данных проекта:', data.error);
                // Устанавливаем базовые данные из проекта
                const fallbackData = {
                    domain: project.domain || '',
                    name: project.name || '',
                    keywords: '',
                    search_engines: project.search_engines || [],
                    regions: project.regions || {},
                    device_settings: project.device_settings || {},
                    position_limit: project.position_limit || 10,
                    subdomains: project.subdomains || false,
                    schedule: project.schedule || null,
                };
                console.log('Using fallback data:', fallbackData);
                setEditData(fallbackData);
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных проекта:', error);
            // Устанавливаем базовые данные из проекта
            const fallbackData = {
                domain: project.domain || '',
                name: project.name || '',
                keywords: '',
                search_engines: project.search_engines || [],
                regions: project.regions || {},
                device_settings: project.device_settings || {},
                position_limit: project.position_limit || 10,
                subdomains: project.subdomains || false,
            };
            console.log('Using fallback data after error:', fallbackData);
            setEditData(fallbackData);
        }
    };

    const handleAddSite = (e) => {
        e.preventDefault();
        postSite(route('seo-stats.store-site'), {
            onSuccess: () => {
                setShowAddSiteModal(false);
                setSiteData({ domain: '', name: '', keywords: '', search_engines: [], regions: {}, device_settings: {}, position_limit: 10, subdomains: false, schedule: null });
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
                setEditData({ domain: '', name: '', keywords: '', search_engines: [], regions: {}, device_settings: {}, position_limit: 10, subdomains: false, schedule: null });
            },
            onError: (errors) => {
                console.error('Error updating site:', errors);
            }
        });
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
                                    className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Создать проект
                                </button>
                    </div>

                    {/* Таблица проектов */}
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
                                                Последнее обновление
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card-bg divide-y divide-border-color">
                                        {sites.map((site) => (
                                            <ProjectTableRow
                                                key={site.id}
                                                project={site}
                                                keywords={keywords}
                                                onViewReports={handleViewReports}
                                                onEditProject={handleEditProject}
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
                }}
                project={editingProject}
                siteData={editData}
                setSiteData={setEditData}
                onSubmit={handleUpdateSite}
                processing={editProcessing}
                errors={editErrors}
            />
        </SeoLayout>
    );
}