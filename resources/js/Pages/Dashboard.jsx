import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, stats, projects }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Приветствие */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Привет, {auth.user.name}! 👋
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Добро пожаловать в Task Manager
                    </p>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Проектов</p>
                                <p className="text-3xl font-bold text-white">{stats.projects_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Задач в работе</p>
                                <p className="text-3xl font-bold text-white">{stats.tasks_in_progress || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Доски проектов */}
                {projects && projects.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Доски проектов</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={route('projects.board', project.id)}
                                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-white">
                                            {project.name}
                                        </h4>
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {project.description || 'Описание отсутствует'}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            {project.tasks_count || 0} задач
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            project.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                                            project.status === 'completed' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                                            project.status === 'on_hold' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                                            'bg-gray-500 bg-opacity-20 text-gray-400'
                                        }`}>
                                            {project.status === 'active' ? 'Активный' :
                                             project.status === 'completed' ? 'Завершен' :
                                             project.status === 'on_hold' ? 'Приостановлен' :
                                             project.status === 'cancelled' ? 'Отменен' : project.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-400 mb-2">Нет проектов</h3>
                        <p className="text-gray-500 mb-4">Создайте первый проект для начала работы</p>
                        <Link
                            href={route('projects.create')}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Создать проект
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
