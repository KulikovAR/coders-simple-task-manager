import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

export default function Dashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-green-400 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Проекты</p>
                                <p className="text-2xl font-semibold text-green-400">{stats.projects_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Задачи</p>
                                <p className="text-2xl font-semibold text-blue-400">{stats.tasks_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Комментарии</p>
                                <p className="text-2xl font-semibold text-yellow-400">{stats.comments_count || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Быстрые действия */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-400 mb-4">Быстрые действия</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href={route('projects.create')}
                            className="flex items-center p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-green-400">Новый проект</span>
                        </Link>

                        <Link
                            href={route('tasks.create')}
                            className="flex items-center p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-blue-400">Новая задача</span>
                        </Link>

                        <Link
                            href={route('projects.index')}
                            className="flex items-center p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="text-green-400">Все проекты</span>
                        </Link>

                        <Link
                            href={route('tasks.index')}
                            className="flex items-center p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span className="text-blue-400">Все задачи</span>
                        </Link>
                    </div>
                </div>

                {/* Последние активности */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-400 mb-4">Последние активности</h3>
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-800 border border-gray-700 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-4"></div>
                            <div className="flex-1">
                                <p className="text-green-400">Добро пожаловать в Task Manager!</p>
                                <p className="text-sm text-gray-400">Начните с создания первого проекта</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
