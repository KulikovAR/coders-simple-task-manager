import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard({ auth, stats, projects }) {
    const [showTips, setShowTips] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dashboardTipsHidden') !== '1';
        }
        return true;
    });

    useEffect(() => {
        if (!showTips && typeof window !== 'undefined') {
            localStorage.setItem('dashboardTipsHidden', '1');
        }
    }, [showTips]);

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
                    <h1 className="text-heading-1 text-gradient mb-3">
                        {getGreeting()}, {auth.user.name}! {getGreetingEmoji()}
                    </h1>
                    <p className="text-body-large text-text-secondary mb-2">
                        Добро пожаловать в Task Manager
                    </p>
                    <p className="text-body-small text-text-muted">
                        Сегодня {new Date().toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Быстрые действия */}
                <div className="card">
                    <h3 className="card-title mb-6">Быстрые действия</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href={route('ai-agent.index')}
                            className="group relative overflow-hidden bg-secondary-bg rounded-xl p-6 hover:bg-accent-purple/5 transition-all duration-300 hover:shadow-glow-purple border border-border-color hover:border-accent-purple/30"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-accent-purple/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-accent-purple/20 rounded-xl group-hover:bg-accent-purple/30 transition-colors duration-300 w-fit mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.2353 21.6875C16.7882 16.8601 18.5042 15.1184 23 13.8125C18.5042 12.5066 16.7882 10.7649 15.2353 5.9375C13.6824 10.7649 11.9664 12.5066 7.47059 13.8125C11.9664 15.1184 13.6824 16.8601 15.2353 21.6875ZM4.88235 9.875C5.65882 7.46 6.51682 6.58981 8.76471 5.9375C6.51682 5.28519 5.65882 4.415 4.88235 2C4.10588 4.415 3.24788 5.28519 1 5.9375C3.24788 6.58981 4.10588 7.46 4.88235 9.875ZM6.82353 23C7.21176 21.7925 7.64012 21.3581 8.76471 21.0312C7.64012 20.7044 7.21176 20.27 6.82353 19.0625C6.43529 20.27 6.00694 20.7044 4.88235 21.0312C6.00694 21.3581 6.43529 21.7925 6.82353 23Z" stroke="url(#paint0_linear_2098_17627)" stroke-width="2" stroke-linejoin="round"/>
                                        <defs>
                                            <linearGradient id="paint0_linear_2098_17627" x1="19.7" y1="2" x2="3.629" y2="23.7242" gradientUnits="userSpaceOnUse">
                                                <stop stop-color="#306FDB"/>
                                                <stop offset="1" stop-color="#7352D4"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <p className="font-semibold text-text-primary mb-1">ИИ-Ассистент</p>
                                <p className="text-body-small text-text-secondary">Управление через ИИ</p>
                            </div>
                        </Link>
                        <Link
                            href={route('projects.create')}
                            className="group relative overflow-hidden bg-secondary-bg rounded-xl p-6 hover:bg-accent-blue/5 transition-all duration-300 hover:shadow-glow-blue border border-border-color hover:border-accent-blue/30"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-accent-blue/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-accent-blue/20 rounded-xl group-hover:bg-accent-blue/30 transition-colors duration-300 w-fit mb-4">
                                    <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-text-primary mb-1">Создать проект</p>
                                <p className="text-body-small text-text-secondary">Новый проект для команды</p>
                            </div>
                        </Link>
                        <Link
                            href={route('tasks.create')}
                            className="group relative overflow-hidden bg-secondary-bg rounded-xl p-6 hover:bg-accent-green/5 transition-all duration-300 hover:shadow-glow-green border border-border-color hover:border-accent-green/30"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-accent-green/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-accent-green/20 rounded-xl group-hover:bg-accent-green/30 transition-colors duration-300 w-fit mb-4">
                                    <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-text-primary mb-1">Создать задачу</p>
                                <p className="text-body-small text-text-secondary">Новая задача для работы</p>
                            </div>
                        </Link>
                        <Link
                            href={route('projects.index')}
                            className="group relative overflow-hidden bg-secondary-bg rounded-xl p-6 hover:bg-accent-yellow/5 transition-all duration-300 hover:shadow-glow-yellow border border-border-color hover:border-accent-yellow/30"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-accent-yellow/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-accent-yellow/20 rounded-xl group-hover:bg-accent-yellow/30 transition-colors duration-300 w-fit mb-4">
                                    <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-text-primary mb-1">Все проекты</p>
                                <p className="text-body-small text-text-secondary">Просмотр всех проектов</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Доски проектов */}
                {projects && projects.length > 0 ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-heading-3 text-text-primary">Доски проектов</h3>
                            <Link
                                href={route('projects.index')}
                                className="text-body-small text-accent-blue hover:text-accent-green transition-colors duration-200 font-medium"
                            >
                                Посмотреть все →
                            </Link>
                        </div>
                        <div className="grid-cards">
                            {projects.map((project, index) => (
                                <Link
                                    key={project.id}
                                    href={route('projects.board', project.id)}
                                    className="card group hover:shadow-glow transition-all duration-300 animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="card-header">
                                        <h4 className="card-title">
                                            {project.name}
                                        </h4>
                                        <svg className="w-5 h-5 text-text-muted group-hover:text-text-secondary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <p className="text-body-small text-text-secondary mb-4 line-clamp-2">
                                        {project.description || 'Описание отсутствует'}
                                    </p>
                                    <div className="flex items-center justify-between text-body-small">
                                        <span className="text-text-muted">
                                            {(() => {
                                                const num = project.tasks_count || 0;
                                                const lastDigit = num % 10;
                                                const lastTwoDigits = num % 100;
                                                
                                                if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                                                    return `${num} задач`;
                                                }
                                                
                                                if (lastDigit === 1) {
                                                    return `${num} задача`;
                                                } else if (lastDigit >= 2 && lastDigit <= 4) {
                                                    return `${num} задачи`;
                                                } else {
                                                    return `${num} задач`;
                                                }
                                            })()}
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
                        <div className="w-20 h-20 bg-accent-slate/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-heading-4 text-text-secondary mb-3">Нет проектов</h3>
                        <p className="text-body-small text-text-muted mb-6">Создайте первый проект для начала работы</p>
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

                {/* Расширенная статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card group hover:shadow-glow-blue transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center">
                            <div className="p-4 bg-accent-blue/10 rounded-xl group-hover:bg-accent-blue/20 transition-colors duration-300">
                                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-body-small font-medium text-text-secondary">Проектов</p>
                                <p className="text-heading-2 text-text-primary">{stats.projects_count || 0}</p>
                                <p className="text-caption text-text-muted mt-1">
                                    {stats.projects_count > 0 ? 'Активных проектов' : 'Создайте первый проект'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card group hover:shadow-glow-green transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center">
                            <div className="p-4 bg-accent-green/10 rounded-xl group-hover:bg-accent-green/20 transition-colors duration-300">
                                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-body-small font-medium text-text-secondary">Задач в работе</p>
                                <p className="text-heading-2 text-text-primary">{stats.tasks_in_progress || 0}</p>
                                <p className="text-caption text-text-muted mt-1">
                                    {stats.tasks_in_progress > 0 ? 'Требуют внимания' : 'Нет активных задач'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card group hover:shadow-glow-purple transition-all duration-300 animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <div className="flex items-center">
                            <div className="p-4 bg-accent-purple/10 rounded-xl group-hover:bg-accent-purple/20 transition-colors duration-300">
                                <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-body-small font-medium text-text-secondary">Спринтов</p>
                                <p className="text-heading-2 text-text-primary">{stats.sprints_count || 0}</p>
                                <p className="text-caption text-text-muted mt-1">
                                    {stats.sprints_count > 0 ? 'Планирование работы' : 'Создайте первый спринт'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Подсказки */}
                {showTips && (
                    <div className="card bg-gradient-to-r from-accent-blue/10 to-accent-green/10 border-accent-blue/20 animate-fade-in" style={{ animationDelay: '500ms' }}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-heading-4 text-text-primary mb-4 flex items-center">
                                    <span className="mr-3 text-2xl">💡</span>
                                    Полезные подсказки
                                </h3>
                                <div className="space-y-3 text-body-small text-text-secondary">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
                                        <p>Используйте <strong>доски проектов</strong> для визуального управления задачами</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
                                        <p>Создавайте <strong>спринты</strong> для планирования работы на определенные периоды</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-accent-purple rounded-full mt-2 flex-shrink-0"></div>
                                        <p>Добавляйте <strong>комментарии</strong> к задачам для лучшего взаимодействия</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                                        <p>Используйте <strong>фильтры по спринтам</strong> на доске для фокусировки на конкретных задачах</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTips(false)}
                                className="text-text-muted hover:text-text-secondary transition-colors duration-200 ml-4 p-2 hover:bg-secondary-bg rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Информация о бета версии */}
                <div className="text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
                    <p className="text-text-muted" style={{ fontSize: '12px' }}>
                        Наш проект пока находится в бета версии и мы активно поддерживаем своих клиентов.
                        Если есть предложения, пишите нам в{' '}
                        <a
                            href="https://t.me/itteam379manager"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-200"
                        >
                            Поддержку
                        </a>
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
