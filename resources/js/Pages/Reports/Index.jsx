import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';

export default function ReportsIndex({ reports, filters, sites }) {
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);

    const { data: exportData, setData: setExportData, post: postExport, processing: exportProcessing, errors: exportErrors } = useForm({
        site_id: '',
        type: 'html',
        filters: {
            date_from: '',
            date_to: '',
            source: ''
        }
    });

    const handleExport = (site) => {
        setSelectedSite(site);
        setExportData({
            site_id: site.id,
            type: 'html',
            filters: {
                date_from: '',
                date_to: '',
                source: ''
            }
        });
        setShowExportModal(true);
    };

    const handleSubmitExport = () => {
        postExport(route('reports.export'), {
            onSuccess: (response) => {
                setShowExportModal(false);
                // Обновляем страницу для показа нового отчета
                router.reload();
            }
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { color: 'bg-green-100 text-green-800', text: 'Завершен' },
            processing: { color: 'bg-yellow-100 text-yellow-800', text: 'Обработка' },
            failed: { color: 'bg-red-100 text-red-800', text: 'Ошибка' }
        };

        const config = statusConfig[status] || statusConfig.failed;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        return type === 'excel' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        );
    };

    return (
      <h1>В разработке ;)</h1>
    );
    var a = (
        <SeoLayout>
            <Head title="Отчеты" />
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
                        <span className="text-text-primary">Отчеты</span>
                    </nav>

                    {/* Заголовок */}
                    <div className="bg-card-bg border border-border-color rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-text-primary mb-2">Отчеты</h1>
                                <p className="text-text-muted">Управление экспортированными отчетами</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-sm text-text-muted">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {reports?.data?.length || 0} отчетов
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {sites?.length || 0} проектов
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Список отчетов */}
                    <div className="bg-card-bg border border-border-color rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border-color bg-secondary-bg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-text-primary">
                                    Все отчеты ({reports?.data?.length || 0})
                                </h3>

                                <button
                                    onClick={() => setShowExportModal(true)}
                                    className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Создать отчет
                                </button>
                            </div>
                        </div>

                        {reports?.data?.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-text-muted mb-4">
                                    <svg className="mx-auto h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-text-primary mb-2">Нет отчетов</h3>
                                <p className="text-text-muted mb-4">Создайте первый отчет для просмотра статистики</p>
                                <button
                                    onClick={() => setShowExportModal(true)}
                                    className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                                >
                                    Создать отчет
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-secondary-bg">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Название</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Проект</th>
                                            <th className="px-6 py-3 text-center text-sm font-medium text-text-primary">Тип</th>
                                            <th className="px-6 py-3 text-center text-sm font-medium text-text-primary">Статус</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Создан</th>
                                            <th className="px-6 py-3 text-center text-sm font-medium text-text-primary">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-color">
                                        {reports?.data?.map((report) => (
                                            <tr key={report.id} className="hover:bg-secondary-bg/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-text-primary font-medium text-sm">
                                                        {report.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-text-primary text-sm">
                                                        {report.site?.name || 'Неизвестный проект'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getTypeIcon(report.type)}
                                                        <span className="text-sm text-text-primary capitalize">
                                                            {report.type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(report.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-text-muted text-sm">
                                                        {new Date(report.created_at).toLocaleDateString('ru-RU', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {report.status === 'completed' && (
                                                            <>
                                                                {report.type === 'excel' && report.file_path && (
                                                                    <a
                                                                        href={route('reports.download', report.id)}
                                                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                                                    >
                                                                        Скачать
                                                                    </a>
                                                                )}
                                                                {report.type === 'html' && report.public_url && (
                                                                    <a
                                                                        href={route('reports.show', report.id)}
                                                                        target="_blank"
                                                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                                                    >
                                                                        Просмотр
                                                                    </a>
                                                                )}
                                                            </>
                                                        )}
                                                        {report.status === 'failed' && (
                                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                                                                Ошибка
                                                            </span>
                                                        )}
                                                        {report.status === 'processing' && (
                                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                                                Обработка...
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Пагинация */}
                    {reports?.links && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-text-muted">
                                Показано {reports.from || 0} - {reports.to || 0} из {reports.total || 0} отчетов
                            </div>
                            <div className="flex items-center gap-2">
                                {reports.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-accent-blue text-white'
                                                : link.url
                                                ? 'bg-secondary-bg text-text-primary hover:bg-border-color'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно создания отчета */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text-primary">Создать отчет</h3>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="text-text-muted hover:text-text-primary transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Проект
                                </label>
                                <select
                                    value={exportData.site_id}
                                    onChange={(e) => setExportData('site_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                >
                                    <option value="">Выберите проект</option>
                                    {sites?.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>
                                {exportErrors.site_id && (
                                    <p className="text-red-500 text-sm mt-1">{exportErrors.site_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Тип отчета
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center p-3 border border-border-color rounded-lg cursor-pointer hover:bg-secondary-bg transition-colors">
                                        <input
                                            type="radio"
                                            value="html"
                                            checked={exportData.type === 'html'}
                                            onChange={(e) => setExportData('type', e.target.value)}
                                            className="mr-2"
                                        />
                                        <div>
                                            <div className="font-medium text-text-primary">HTML</div>
                                            <div className="text-sm text-text-muted">Веб-страница</div>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-3 border border-border-color rounded-lg cursor-pointer hover:bg-secondary-bg transition-colors">
                                        <input
                                            type="radio"
                                            value="excel"
                                            checked={exportData.type === 'excel'}
                                            onChange={(e) => setExportData('type', e.target.value)}
                                            className="mr-2"
                                        />
                                        <div>
                                            <div className="font-medium text-text-primary">Excel</div>
                                            <div className="text-sm text-text-muted">Таблица</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="flex-1 px-4 py-2 bg-secondary-bg text-text-primary rounded-lg hover:bg-border-color transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleSubmitExport}
                                    disabled={!exportData.site_id || exportProcessing}
                                    className="flex-1 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportProcessing ? 'Создание...' : 'Создать'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SeoLayout>
    );
}

