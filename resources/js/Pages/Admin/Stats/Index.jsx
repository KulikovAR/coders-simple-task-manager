import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminStats({ auth, stats, filters = {} }) {
    // Устанавливаем значения по умолчанию: последний месяц
    const getDefaultDateFrom = () => {
        if (filters.date_from) return filters.date_from;
        if (stats.date_range?.from) return stats.date_range.from;
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    };

    const getDefaultDateTo = () => {
        if (filters.date_to) return filters.date_to;
        if (stats.date_range?.to) return stats.date_range.to;
        return new Date().toISOString().split('T')[0];
    };

    const [dateFrom, setDateFrom] = useState(getDefaultDateFrom());
    const [dateTo, setDateTo] = useState(getDefaultDateTo());

    const handleDateChange = () => {
        const params = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        
        router.get(route('admin.stats.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        const date = new Date();
        const defaultFrom = new Date(date);
        defaultFrom.setMonth(defaultFrom.getMonth() - 1);
        
        setDateFrom(defaultFrom.toISOString().split('T')[0]);
        setDateTo(date.toISOString().split('T')[0]);
        
        router.get(route('admin.stats.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Статистика - Admin Panel" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Статистика системы</h1>
                            <p className="text-gray-300">Аналитика по пользователям, проектам и SEO метрикам</p>
                        </div>
                    </div>
                    
                    {/* Фильтр по датам */}
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Дата от
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Дата до
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDateChange}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Применить
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                                >
                                    Сбросить
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-400">
                            Период: {stats.date_range?.from} - {stats.date_range?.to}
                        </div>
                    </div>
                </div>

                {/* Метрики по пользователям */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Метрики по пользователям</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <MetricCard
                            title="Всего пользователей"
                            value={stats.users?.total || 0}
                            icon="👥"
                            color="blue"
                        />
                        <MetricCard
                            title="Новых за период"
                            value={stats.users?.new || 0}
                            icon="✨"
                            color="green"
                        />
                        <MetricCard
                            title="Активных пользователей"
                            value={stats.users?.active?.count || 0}
                            icon="🔥"
                            color="yellow"
                        />
                    </div>

                    {/* Топ пользователи по проектам */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Топ пользователей по количеству проектов</h3>
                        <Table
                            headers={['Пользователь', 'Email', 'Количество проектов']}
                            rows={stats.users?.top_by_projects?.map(user => [
                                user.user_name,
                                user.user_email,
                                user.projects_count
                            ]) || []}
                        />
                    </div>

                    {/* Топ пользователи по запускам съемов */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Топ пользователей по запускам съемов</h3>
                        <Table
                            headers={['Пользователь', 'Email', 'SEO съемы', 'Wordstat', 'Всего']}
                            rows={stats.users?.top_by_tracking?.map(user => [
                                user.user_name,
                                user.user_email,
                                user.seo_runs || 0,
                                user.wordstat_runs || 0,
                                user.total_runs || 0
                            ]) || []}
                        />
                    </div>

                    {/* Активные пользователи */}
                    {stats.users?.active?.users && stats.users.active.users.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Активные пользователи</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.users.active.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                                    >
                                        <div className="font-medium text-white">{user.name}</div>
                                        <div className="text-sm text-gray-400">{user.email}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Регистрация: {user.created_at}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Метрики по проектам */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Метрики по проектам</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <MetricCard
                            title="Всего проектов"
                            value={stats.projects?.total || 0}
                            icon="📁"
                            color="purple"
                        />
                        <MetricCard
                            title="Новых за период"
                            value={stats.projects?.new || 0}
                            icon="🆕"
                            color="green"
                        />
                    </div>

                    {/* Проекты по пользователям */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Проекты по пользователям</h3>
                        <Table
                            headers={['Пользователь', 'Email', 'Количество проектов']}
                            rows={stats.projects?.by_users?.map(user => [
                                user.user_name,
                                user.user_email,
                                user.projects_count
                            ]) || []}
                        />
                    </div>

                    {/* Топ проекты по ключевым словам */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Топ проекты по объему ключевых слов</h3>
                        <Table
                            headers={['Проект', 'Владелец', 'Email', 'Ключевых слов']}
                            rows={stats.projects?.top_by_keywords?.map(project => [
                                project.site_name,
                                project.user_name,
                                project.user_email,
                                project.keywords_count
                            ]) || []}
                        />
                    </div>
                </div>

                {/* Метрики по семантике и съемам */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Метрики по семантике и съемам</h2>
                    
                    {/* Ключевые слова */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Ключевые слова</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Всего ключевых слов"
                                value={stats.seo?.keywords?.total || 0}
                                icon="🔑"
                                color="blue"
                            />
                            <MetricCard
                                title="Среднее на проект"
                                value={stats.seo?.keywords?.avg_per_project || 0}
                                icon="📊"
                                color="green"
                            />
                            <MetricCard
                                title="Среднее на пользователя"
                                value={stats.seo?.keywords?.avg_per_user || 0}
                                icon="👤"
                                color="yellow"
                            />
                        </div>
                    </div>

                    {/* Запуски съемов */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Запуски съемов позиций</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <MetricCard
                                title="Всего запусков"
                                value={stats.seo?.tracking_runs?.total || 0}
                                icon="🚀"
                                color="purple"
                            />
                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">По поисковикам</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Google:</span>
                                        <span className="text-white font-semibold">
                                            {stats.seo?.tracking_runs?.by_engines?.google || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Yandex:</span>
                                        <span className="text-white font-semibold">
                                            {stats.seo?.tracking_runs?.by_engines?.yandex || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Wordstat:</span>
                                        <span className="text-white font-semibold">
                                            {stats.seo?.tracking_runs?.by_engines?.wordstat || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Частота съемов */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Частота съемов</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-medium text-gray-300 mb-3">По пользователям (топ 10)</h4>
                                <Table
                                    headers={['Пользователь', 'SEO', 'Wordstat', 'Всего']}
                                    rows={stats.seo?.frequency?.by_users?.slice(0, 10).map(user => [
                                        user.user_name,
                                        user.seo_runs || 0,
                                        user.wordstat_runs || 0,
                                        user.total_runs || 0
                                    ]) || []}
                                />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-300 mb-3">По проектам (топ 10)</h4>
                                <Table
                                    headers={['Проект', 'Запусков']}
                                    rows={stats.seo?.frequency?.by_projects?.slice(0, 10).map(project => [
                                        project.site_name,
                                        project.runs_count
                                    ]) || []}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function MetricCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-600/20 border-blue-500/50',
        green: 'bg-green-600/20 border-green-500/50',
        yellow: 'bg-yellow-600/20 border-yellow-500/50',
        purple: 'bg-purple-600/20 border-purple-500/50',
    };

    return (
        <div className={`border rounded-lg p-4 ${colorClasses[color] || colorClasses.blue}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">{title}</div>
                <div className="text-2xl">{icon}</div>
            </div>
            <div className="text-3xl font-bold text-white">{value.toLocaleString('ru-RU')}</div>
        </div>
    );
}

function Table({ headers, rows }) {
    if (!rows || rows.length === 0) {
        return (
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 text-center text-gray-400">
                Нет данных
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-600">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="text-left py-3 px-4 text-sm font-semibold text-gray-300"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="py-3 px-4 text-sm text-gray-300"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

