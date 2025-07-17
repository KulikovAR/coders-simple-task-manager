import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, stats, projects }) {
    const [showTips, setShowTips] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Доброе утро';
        if (hour < 18) return 'Добрый день';
        return 'Добрый вечер';
    };

    const getGreetingEmoji = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅';
        if (hour < 18) return '☀️';
        return '🌙';
    };

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
                        {getGreeting()}, {auth.user.name}! {getGreetingEmoji()}
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Добро пожаловать в Task Manager
                    </p>
                    <p className="text-text-muted text-sm mt-1">
                        Сегодня {new Date().toLocaleDateString('ru-RU', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>

                {/* Подсказки */}
                {showTips && (
                    <div className="card bg-gradient-to-r from-accent-blue/10 to-accent-green/10 border-accent-blue/20">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center">
                                    💡 Полезные подсказки
                                </h3>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <p>• Используйте <strong>доски проектов</strong> для визуального управления задачами</p>
                                    <p>• Создавайте <strong>спринты</strong> для планирования работы на определенные периоды</p>
                                    <p>• Добавляйте <strong>комментарии</strong> к задачам для лучшего взаимодействия</p>
                                    <p>• Используйте <strong>фильтры по спринтам</strong> на доске для фокусировки на конкретных задачах</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTips(false)}
                                className="text-text-muted hover:text-text-secondary transition-colors ml-4"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Расширенная статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card group hover:shadow-glow transition-all duration-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-secondary-bg rounded-lg group-hover:bg-accent-blue/20 transition-colors">
                                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-text-secondary">Проектов</p>
                                <p className="text-3xl font-bold text-text-primary">{stats.projects_count || 0}</p>
                                <p className="text-xs text-text-muted mt-1">
                                    {stats.projects_count > 0 ? 'Активных проектов' : 'Создайте первый проект'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card group hover:shadow-glow transition-all duration-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-secondary-bg rounded-lg group-hover:bg-accent-green/20 transition-colors">
                                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-text-secondary">Задач в работе</p>
                                <p className="text-3xl font-bold text-text-primary">{stats.tasks_in_progress || 0}</p>
                                <p className="text-xs text-text-muted mt-1">
                                    {stats.tasks_in_progress > 0 ? 'Требуют внимания' : 'Нет активных задач'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card group hover:shadow-glow transition-all duration-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-secondary-bg rounded-lg group-hover:bg-accent-purple/20 transition-colors">
                                <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-text-secondary">Спринтов</p>
                                <p className="text-3xl font-bold text-text-primary">{stats.sprints_count || 0}</p>
                                <p className="text-xs text-text-muted mt-1">
                                    {stats.sprints_count > 0 ? 'Планирование работы' : 'Создайте первый спринт'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Быстрые действия */}
                <div className="card">
                    <h3 className="card-title mb-4">Быстрые действия</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href={route('projects.create')}
                            className="flex items-center p-4 bg-secondary-bg rounded-lg hover:bg-accent-blue/10 transition-colors group"
                        >
                            <div className="p-2 bg-accent-blue/20 rounded-lg group-hover:bg-accent-blue/30 transition-colors">
                                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="font-medium text-text-primary">Создать проект</p>
                                <p className="text-sm text-text-secondary">Новый проект для команды</p>
                            </div>
                        </Link>

                        <Link
                            href={route('tasks.create')}
                            className="flex items-center p-4 bg-secondary-bg rounded-lg hover:bg-accent-green/10 transition-colors group"
                        >
                            <div className="p-2 bg-accent-green/20 rounded-lg group-hover:bg-accent-green/30 transition-colors">
                                <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="font-medium text-text-primary">Создать задачу</p>
                                <p className="text-sm text-text-secondary">Новая задача для работы</p>
                            </div>
                        </Link>

                        <Link
                            href={route('projects.index')}
                            className="flex items-center p-4 bg-secondary-bg rounded-lg hover:bg-accent-yellow/10 transition-colors group"
                        >
                            <div className="p-2 bg-accent-yellow/20 rounded-lg group-hover:bg-accent-yellow/30 transition-colors">
                                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="font-medium text-text-primary">Все проекты</p>
                                <p className="text-sm text-text-secondary">Просмотр всех проектов</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Доски проектов */}
                {projects && projects.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-text-primary">Доски проектов</h3>
                            <Link
                                href={route('projects.index')}
                                className="text-sm text-accent-blue hover:text-accent-green transition-colors"
                            >
                                Посмотреть все →
                            </Link>
                        </div>
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
