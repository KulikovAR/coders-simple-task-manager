import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, stats, projects }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-text-primary leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Приветствие */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        Привет, {auth.user.name}! 👋
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Добро пожаловать в Task Manager
                    </p>
                </div>

                {/* Статистика */}
                <div className="grid-stats">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-3 bg-secondary-bg rounded-lg">
                                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-text-secondary">Проектов</p>
                                <p className="text-3xl font-bold text-text-primary">{stats.projects_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-3 bg-secondary-bg rounded-lg">
                                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-text-secondary">Задач в работе</p>
                                <p className="text-3xl font-bold text-text-primary">{stats.tasks_in_progress || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Доски проектов */}
                {projects && projects.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-text-primary">Доски проектов</h3>
                        <div className="grid-cards">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={route('projects.board', project.id)}
                                    className="card group hover:shadow-glow transition-all duration-200"
                                >
                                    <div className="card-header">
                                        <h4 className="card-title">
                                            {project.name}
                                        </h4>
                                        <svg className="w-5 h-5 text-text-muted group-hover:text-text-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                                        {project.description || 'Описание отсутствует'}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-muted">
                                            {project.tasks_count || 0} задач
                                        </span>
                                        <span className={`status-badge ${
                                            project.status === 'active' ? 'status-active' :
                                            project.status === 'completed' ? 'status-completed' :
                                            project.status === 'on_hold' ? 'status-on-hold' :
                                            'status-todo'
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
                    <div className="card text-center">
                        <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-text-secondary mb-2">Нет проектов</h3>
                        <p className="text-text-muted mb-4">Создайте первый проект для начала работы</p>
                        <Link
                            href={route('projects.create')}
                            className="btn btn-primary inline-flex items-center"
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
