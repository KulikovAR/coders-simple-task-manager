import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';

export default function JobShow({ auth, job }) {
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                refreshJob();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const refreshJob = async () => {
        setRefreshing(true);
        try {
            await router.reload({ only: ['job'] });
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getProgressBar = () => {
        if (job.status !== 'running' && job.status !== 'completed') {
            return null;
        }

        const progress = job.total_tasks > 0 ? (job.completed_tasks / job.total_tasks) * 100 : 0;
        
        return (
            <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const formatDuration = () => {
        if (!job.created_at) return '-';
        
        const start = new Date(job.created_at);
        const end = job.completed_at ? new Date(job.completed_at) : new Date();
        const duration = Math.floor((end - start) / 1000);
        
        if (duration < 60) return `${duration} секунд`;
        if (duration < 3600) return `${Math.floor(duration / 60)} минут`;
        return `${Math.floor(duration / 3600)} часов`;
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`Job ${job.id}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-bold text-white">Job {job.id}</h1>
                                {getStatusBadge(job.status)}
                            </div>
                            <p className="text-gray-300">Детальная информация о джобе отслеживания</p>
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
                                onClick={refreshJob}
                                disabled={refreshing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {refreshing ? 'Обновление...' : 'Обновить'}
                            </button>
                            
                            <Link
                                href={route('admin.jobs.index')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                            >
                                ← Назад к списку
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                {(job.status === 'running' || job.status === 'completed') && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Прогресс выполнения</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Выполнено задач:</span>
                                <span className="text-white font-medium">
                                    {job.completed_tasks || 0} из {job.total_tasks || 0}
                                </span>
                            </div>
                            {getProgressBar()}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Прогресс:</span>
                                <span className="text-white font-medium">
                                    {job.total_tasks > 0 ? Math.round((job.completed_tasks / job.total_tasks) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Job Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Основная информация</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">ID:</span>
                                <span className="text-white font-mono">{job.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Site ID:</span>
                                <span className="text-white">{job.site_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Источник:</span>
                                <span className="text-white">{job.source || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Статус:</span>
                                {getStatusBadge(job.status)}
                            </div>
                        </div>
                    </div>

                    {/* Timing Info */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Временные данные</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Создан:</span>
                                <span className="text-white">{formatDate(job.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Обновлен:</span>
                                <span className="text-white">{formatDate(job.updated_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Завершен:</span>
                                <span className="text-white">{formatDate(job.completed_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Длительность:</span>
                                <span className="text-white">{formatDuration()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Summary */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Статистика задач</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                {job.total_tasks || 0}
                            </div>
                            <div className="text-gray-400">Всего задач</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                {job.completed_tasks || 0}
                            </div>
                            <div className="text-gray-400">Выполнено</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-400 mb-2">
                                {job.failed_tasks || 0}
                            </div>
                            <div className="text-gray-400">Ошибок</div>
                        </div>
                    </div>
                </div>

                {/* Error Information */}
                {job.error && (
                    <div className="bg-gray-800 border border-red-500 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-red-400 mb-4">Информация об ошибке</h2>
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <pre className="text-red-300 text-sm whitespace-pre-wrap overflow-x-auto">
                                {job.error}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Действия</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href={route('admin.jobs.index', { site_id: job.site_id })}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Показать джобы этого сайта
                        </Link>
                        
                        <Link
                            href={route('admin.jobs.index', { status: job.status })}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                        >
                            Показать джобы с этим статусом
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
