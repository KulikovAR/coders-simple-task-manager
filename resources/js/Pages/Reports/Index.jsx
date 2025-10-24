import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import axios from 'axios';

export default function ReportsIndex({ reports, filters, sites, auth }) {
    const [processingReports, setProcessingReports] = useState(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            processingReports.forEach(reportId => {
                checkReportStatus(reportId);
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [processingReports]);

    const checkReportStatus = async (reportId) => {
        try {
            const response = await axios.get(route('reports.status', reportId));
            const { status } = response.data;

            if (status === 'completed' || status === 'failed') {
                setProcessingReports(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(reportId);
                    return newSet;
                });
                router.reload();
            }
        } catch (error) {
            console.error('Error checking report status:', error);
        }
    };

    const getStatusBadge = (status, reportId) => {
        const isProcessing = processingReports.has(reportId);
        const actualStatus = isProcessing ? 'processing' : status;

        const statusConfig = {
            completed: { color: 'bg-green-100 text-green-800', text: 'Завершен' },
            processing: { color: 'bg-yellow-100 text-yellow-800', text: 'Обработка' },
            failed: { color: 'bg-red-100 text-red-800', text: 'Ошибка' }
        };

        const config = statusConfig[actualStatus] || statusConfig.failed;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex justify-center items-center gap-1`}>
                {actualStatus === 'processing' && (
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                )}
                {config.text}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        return type === 'excel' ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ) : (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        );
    };

    return (
        <SeoLayout user={auth.user}>
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
                                <p className="text-text-muted mb-4">Отчеты создаются на страницах проектов</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-secondary-bg">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Название</th>
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
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getTypeIcon(report.type)}
                                                        <span className="text-sm text-text-primary capitalize">
                                                            {report.type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(report.status, report.id)}
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
                                                        {(report.status === 'processing' || processingReports.has(report.id)) && (
                                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium flex items-center gap-1">
                                                                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
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

        </SeoLayout>
    );
}
