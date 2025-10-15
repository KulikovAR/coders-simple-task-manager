import { Head, Link } from '@inertiajs/react';
import SeoLayout from '@/Layouts/SeoLayout';
import XmlRiverLogo from '@/Components/XmlRiverLogo';

export default function SeoDashboard({ auth }) {
    const features = [
        {
            icon: (
                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Отслеживание позиций",
            description: "Мониторинг позиций ваших сайтов в поисковых системах Яндекс и Google в режиме реального времени"
        },
        {
            icon: (
                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            title: "Аналитика и отчеты",
            description: "Детальная аналитика изменений позиций с графиками и трендами для принятия решений"
        },
        {
            icon: (
                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            title: "Ключевые слова",
            description: "Управление списком ключевых слов для каждого проекта с возможностью группировки и фильтрации"
        },
        {
            icon: (
                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Автоматизация",
            description: "Автоматическое отслеживание позиций по расписанию с уведомлениями о значительных изменениях"
        },
        {
            icon: (
                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "Командная работа",
            description: "Совместная работа над проектами с возможностью назначения ролей и прав доступа"
        },
        {
            icon: (
                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "API интеграция",
            description: "Полноценное API для интеграции с внешними системами и автоматизации процессов"
        }
    ];


    return (
        <SeoLayout user={auth.user}>
            <Head title="SEO Дашборд" />

            <div className="min-h-screen bg-primary-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Заголовок с логотипом сотрудничества */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <XmlRiverLogo className="text-2xl" />
                        </div>
                        <h1 className="text-4xl font-bold text-text-primary mb-4">
                            SEO Аналитика
                        </h1>
                        <p className="text-xl text-text-muted max-w-3xl mx-auto">
                            Современная платформа для отслеживания позиций в поисковых системах.
                        </p>
                    </div>


                    {/* Быстрые действия */}
                    <div className="bg-card-bg border border-border-color rounded-xl p-8 mb-12 shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Быстрые действия</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href={route('seo-stats.index')}
                                className="flex items-center gap-4 p-4 bg-secondary-bg border border-border-color rounded-lg hover:bg-accent-blue/5 hover:border-accent-blue/30 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center group-hover:bg-accent-blue/30 transition-colors">
                                    <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Мои проекты</h3>
                                    <p className="text-sm text-text-muted">Просмотр и управление проектами</p>
                                </div>
                            </Link>

                            <div className="flex items-center gap-4 p-4 bg-secondary-bg border border-border-color rounded-lg opacity-50">
                                <div className="w-10 h-10 bg-gray-400/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Отчеты</h3>
                                    <p className="text-sm text-text-muted">Скоро будет доступно</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Возможности платформы */}
                    <div className="bg-card-bg border border-border-color rounded-xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Возможности платформы</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary mb-2">{feature.title}</h3>
                                        <p className="text-sm text-text-muted">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Информация об интеграции с XML River */}
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-accent-blue/10 to-accent-blue/5 border border-accent-blue/20 rounded-xl p-8">
                            <h3 className="text-xl font-bold text-text-primary mb-4">
                                Интеграция с XML River API
                            </h3>
                            <p className="text-text-muted max-w-2xl mx-auto mb-6">
                                Мы используем мощное API <span className="text-accent-blue font-semibold">XML River</span> для сбора данных
                                из поисковых систем. Укажите свои ключи доступа в настройках проекта и получите доступ к
                                профессиональному мониторингу позиций с нашей удобной визуализацией и аналитикой.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-text-primary">Надежный сбор данных</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-text-primary">Удобная визуализация</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="text-text-primary">Детальная аналитика</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <a
                                    href="https://xmlriver.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent-blue hover:text-accent-blue/80 font-medium"
                                >
                                    Получить ключи API XML River →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SeoLayout>
    );
}
