import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';

export default function JobsIndex({ auth, jobs, pagination, meta, filters }) {
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                refreshData();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const refreshData = async () => {
        setRefreshing(true);
        try {
            await router.reload({ only: ['jobs', 'pagination', 'meta', 'stats'] });
        } finally {
            setRefreshing(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-500', text: 'Ожидает' },
            running: { color: 'bg-blue-500', text: 'Выполняется' },
            completed: { color: 'bg-green-500', text: 'Завершен' },
            failed: { color: 'bg-red-500', text: 'Ошибка' },
            cancelled: { color: 'bg-gray-500', text: 'Отменен' }
        };

        const config = statusConfig[status] || statusConfig.failed;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getProgressBar = (job) => {
        if (job.status !== 'running' && job.status !== 'completed') {
            return null;
        }

        const progress = job.total_tasks > 0 ? (job.completed_tasks / job.total_tasks) * 100 : 0;
        
        return (
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const formatDuration = (job) => {
        if (!job.created_at) return '-';
        
        const start = new Date(job.created_at);
        const end = job.completed_at ? new Date(job.completed_at) : new Date();
        const duration = Math.floor((end - start) / 1000);
        
        if (duration < 60) return `${duration}с`;
        if (duration < 3600) return `${Math.floor(duration / 60)}м`;
        return `${Math.floor(duration / 3600)}ч`;
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Tracking Jobs" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Tracking Jobs</h1>
                            <p className="text-gray-300">Мониторинг джобов отслеживания позиций</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    autoRefresh 
                                        ? 'bg-green-600 text-white hover:bg-green-700' 
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                            >
                                {autoRefresh ? '🔄 Автообновление' : '⏸️ Автообновление'}
                            </button>
                            
                            <button
                                onClick={refreshData}
                                disabled={refreshing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {refreshing ? 'Обновление...' : 'Обновить'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Фильтры</h2>
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={filters.status || ''}
                            onChange={(e) => router.get(route('admin.jobs.index'), { ...filters, status: e.target.value || undefined })}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Все статусы</option>
                            <option value="pending">Ожидают</option>
                            <option value="running">Выполняются</option>
                            <option value="completed">Завершены</option>
                            <option value="failed">Ошибки</option>
                            <option value="cancelled">Отменены</option>
                        </select>
                        
                        <input
                            type="number"
                            placeholder="Site ID"
                            value={filters.site_id || ''}
                            onChange={(e) => router.get(route('admin.jobs.index'), { ...filters, site_id: e.target.value || undefined })}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        
                        <select
                            value={filters.per_page || 20}
                            onChange={(e) => router.get(route('admin.jobs.index'), { ...filters, per_page: e.target.value })}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="10">10 на странице</option>
                            <option value="20">20 на странице</option>
                            <option value="50">50 на странице</option>
                            <option value="100">100 на странице</option>
                        </select>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white">
                            Джобы ({pagination.total || 0})
                        </h2>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Нет джобов</h3>
                            <p className="text-gray-400">Джобы появятся здесь после запуска отслеживания</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">ID</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Site ID</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Статус</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Прогресс</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Источник</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Создан</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Длительность</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={route('admin.jobs.show', job.id)}
                                                    className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                                                >
                                                    {job.id}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-white text-sm">
                                                {job.site_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(job.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {job.completed_tasks || 0} / {job.total_tasks || 0}
                                                </div>
                                                {getProgressBar(job)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">
                                                {job.source || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">
                                                {formatDate(job.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">
                                                {formatDuration(job)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('admin.jobs.show', job.id)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        Просмотр
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            Показано {pagination.from || 0} - {pagination.to || 0} из {pagination.total || 0} джобов
                        </div>
                        <div className="flex items-center gap-2">
                            {pagination.current_page > 1 && (
                                <button
                                    onClick={() => router.get(route('admin.jobs.index'), { ...filters, page: pagination.current_page - 1 })}
                                    className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    ← Предыдущая
                                </button>
                            )}
                            
                            <span className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                                {pagination.current_page} из {pagination.last_page}
                            </span>
                            
                            {pagination.current_page < pagination.last_page && (
                                <button
                                    onClick={() => router.get(route('admin.jobs.index'), { ...filters, page: pagination.current_page + 1 })}
                                    className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Следующая →
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Meta Info */}
                {meta && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Время запроса: {meta.query_time_ms}ms</span>
                            <span>Кэшировано: {meta.cached ? 'Да' : 'Нет'}</span>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
