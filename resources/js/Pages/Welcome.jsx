import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Waves from '@/Components/Waves';

export default function Welcome({ auth }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Принудительно устанавливаем темную тему для лендинга
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        
        // Устанавливаем атрибут data-page для CSS правил
        document.body.setAttribute('data-page', 'Welcome');
        
        setIsLoaded(true);
        
        // Очищаем атрибут при размонтировании компонента
        return () => {
            document.body.removeAttribute('data-page');
        };
    }, []);

    return (
        <>
            <Head>
                <title>379ТМ - Управление задачами с ИИ-ассистентом для команд</title>
                <meta name="description" content="Система управления задачами для любых команд. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат." />
                <meta name="keywords" content="управление задачами, таск менеджер, ИИ ассистент, управление проектами, спринты, команда, продуктивность, бизнес, маркетинг, дизайн" />
                <meta name="author" content="379ТМ" />
                <meta name="robots" content="index, follow" />

                {/* Open Graph */}
                <meta property="og:title" content="379ТМ - Управление задачами с ИИ-ассистентом" />
                <meta property="og:description" content="Система управления задачами для любых команд. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="/og-image.jpg" />
                <meta property="og:site_name" content="379ТМ" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="379ТМ - Управление задачами с ИИ-ассистентом" />
                <meta name="twitter:description" content="Система управления задачами для любых команд. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат." />
                <meta name="twitter:image" content="/og-image.jpg" />

                {/* Дополнительные SEO мета-теги */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta name="msapplication-TileColor" content="#000000" />
                <link rel="canonical" href={window.location.href} />

                {/* Структурированные данные */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "379ТМ",
                        "description": "Система управления задачами для любых команд. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат.",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "RUB"
                        },
                        "author": {
                            "@type": "Organization",
                            "name": "379ТМ"
                        }
                    })}
                </script>
            </Head>

            <div className="min-h-screen bg-primary-bg text-text-primary relative overflow-hidden">
                {/* Waves Background */}
                <Waves
                    lineColor="rgba(59, 130, 246, 0.1)"
                    backgroundColor="transparent"
                    waveSpeedX={0.008}
                    waveSpeedY={0.004}
                    waveAmpX={20}
                    waveAmpY={10}
                    xGap={15}
                    yGap={40}
                    friction={0.95}
                    tension={0.003}
                    maxCursorMove={80}
                    style={{ zIndex: 1 }}
                />

                {/* Header */}
                <header className={`fixed top-0 left-0 right-0 z-50 bg-primary-bg/80 backdrop-blur-xl border-b border-border-color transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <nav className="max-w-6xl mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="text-2xl font-semibold text-text-primary flex items-center gap-2">
                                <span>379ТМ</span>
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                                    beta
                                </span>
                            </div>
                            <div className="flex space-x-8 items-center">
                                <a
                                    href="https://t.me/itteam379manager"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-text-secondary hover:text-text-primary transition-colors duration-300 flex items-center gap-1 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                    </svg>
                                    Поддержка
                                </a>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-text-primary hover:text-text-secondary transition-colors font-medium"
                                    >
                                        Дашборд
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-text-primary hover:text-text-secondary transition-colors font-medium"
                                        >
                                            Вход
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-accent-blue text-white px-6 py-2 rounded-full font-medium hover:bg-accent-blue/80 transition-all duration-300 transform hover:scale-105"
                                        >
                                            Регистрация
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="pt-24 relative z-10">
                    {/* Hero Section */}
                    <section className="max-w-4xl mx-auto px-6 py-20 pb-32 text-center">
                        <div className={`mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <span className="inline-block bg-accent-blue/20 text-accent-blue px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
                                ИИ-ассистент включен
                            </span>
                        </div>

                        <h1 className={`text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Управление задачами
                            <br />
                            <span className="text-text-secondary">с ИИ-ассистентом</span>
                        </h1>

                        <p className={`text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Система управления задачами для любых команд. Создавайте проекты, планируйте спринты,
                            назначайте задачи и отслеживайте прогресс. ИИ-ассистент помогает управлять всем через чат.
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {!auth.user ? (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="bg-accent-blue text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent-blue/80 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Начать бесплатно
                                    </Link>
                                    <Link
                                        href={route('ai-features')}
                                        className="border border-border-color text-text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-secondary-bg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Узнать больше
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-accent-blue text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent-blue/80 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                >
                                    Перейти в дашборд
                                </Link>
                            )}
                        </div>

                        {/* Stats */}
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 max-w-2xl mx-auto mb-16 transition-all duration-1000 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {[
                                { number: "10,000+", label: "Активных пользователей" },
                                { number: "50,000+", label: "Выполненных задач" },
                                { number: "24/7", label: "Доступность системы" }
                            ].map((stat, index) => (
                                <div key={index} className="text-center group">
                                    <div className="text-4xl font-bold text-text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                                        {stat.number}
                                    </div>
                                    <div className="text-text-secondary text-sm group-hover:text-text-primary transition-colors duration-300">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="max-w-6xl mx-auto px-6 py-32">
                        <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Возможности платформы
                            </h2>
                            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                                Все инструменты для управления проектами в одном месте
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                                    title: "ИИ-ассистент",
                                    description: "Управляйте задачами через чат на русском языке"
                                },
                                {
                                    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                                    title: "Управление проектами",
                                    description: "Создавайте проекты и добавляйте участников команды"
                                },
                                {
                                    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                                    title: "Планирование",
                                    description: "Планируйте спринты, этапы и отслеживайте их выполнение"
                                },
                                {
                                    icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                                    title: "Управление задачами",
                                    description: "Создавайте задачи, назначайте исполнителей и добавляйте комментарии"
                                }
                            ].map((feature, index) => (
                                <div key={index} className={`text-center group transition-all duration-1000 delay-${500 + index * 100} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                    <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-accent-blue/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                        <svg className="w-8 h-8 text-accent-blue transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={feature.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-text-primary mb-4 group-hover:text-text-secondary transition-colors duration-300">{feature.title}</h3>
                                    <p className="text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Teams Section */}
                    <section className="max-w-6xl mx-auto px-6 py-32">
                        <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Для любых команд
                            </h2>
                            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                                379ТМ подходит для команд любого размера и специализации
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
                                    title: "Разработка",
                                    description: "Управление проектами, спринты, баг-трекинг"
                                },
                                {
                                    icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                                    title: "Маркетинг",
                                    description: "Кампании, контент-планы, аналитика"
                                },
                                {
                                    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v.01",
                                    title: "Дизайн",
                                    description: "Проекты, макеты, этапы разработки"
                                },
                                {
                                    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                                    title: "Бизнес",
                                    description: "Стратегии, процессы, управление"
                                }
                            ].map((team, index) => (
                                <div key={index} className={`text-center group transition-all duration-1000 delay-${500 + index * 100} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                    <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-accent-blue/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                        <svg className="w-8 h-8 text-accent-blue transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={team.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-text-primary mb-4 group-hover:text-text-secondary transition-colors duration-300">{team.title}</h3>
                                    <p className="text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300">{team.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mb-16"></div>
                    </section>

                    {/* AI Assistant Section */}
                    <section className="max-w-6xl mx-auto px-6 py-32">
                        <div className={`bg-secondary-bg/50 rounded-3xl p-12 md:p-16 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                    ИИ-ассистент
                                </h2>
                                <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                                    Управляйте проектами через чат. Пишите команды на русском языке,
                                    и система автоматически создаст проекты, задачи и этапы работы.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                                                {[
                                'Создай новый проект "Маркетинговая кампания"',
                                'Назначь задачу "Подготовить презентацию" на меня',
                                'Покажи статистику по проектам',
                                'Создай спринт на следующую неделю'
                            ].map((command, index) => (
                                        <div key={index} className={`bg-card-bg/50 border border-border-color p-6 rounded-2xl transition-all duration-500 delay-${index * 100} hover:bg-card-bg/70 hover:border-accent-blue/30 hover:scale-105 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                                            <div className="text-text-primary text-sm mb-2">{command}</div>
                                            <div className="text-text-secondary text-sm">ИИ-ассистент выполнит команду автоматически</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className={`relative transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                        <div className="w-40 h-40 bg-accent-blue/20 rounded-full flex items-center justify-center animate-pulse">
                                            <svg className="w-20 h-20 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                            <div className="w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="max-w-4xl mx-auto px-6 py-32 text-center">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Готовы начать?
                        </h2>
                        <p className={`text-xl text-text-secondary mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Присоединяйтесь к командам, которые уже используют 379ТМ для управления проектами
                        </p>
                        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {!auth.user ? (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="bg-accent-blue text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-accent-blue/80 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Начать бесплатно
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="border-2 border-border-color text-text-primary bg-transparent px-10 py-4 rounded-full font-semibold text-lg hover:bg-secondary-bg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Войти в систему
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-accent-blue text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-accent-blue/80 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                >
                                    Перейти в дашборд
                                </Link>
                            )}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className={`border-t border-border-color py-12 transition-all duration-1000 delay-900 relative z-10 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-text-secondary mb-4 md:mb-0">
                                <div>© 2025 379ТМ. Создано для команд</div>
                                <div className="text-sm mt-1">ИНН 614014794226</div>
                            </div>
                            <div className="flex space-x-8">
                                <Link href={route('faq')} className="text-text-secondary hover:text-text-primary transition-colors duration-300">
                                    FAQ
                                </Link>
                                <Link href={route('ai-features')} className="text-text-secondary hover:text-text-primary transition-colors duration-300">
                                    ИИ-ассистент
                                </Link>
                                <a
                                    href="https://t.me/itteam379manager"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-text-secondary hover:text-text-primary transition-colors duration-300 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                    </svg>
                                    Техподдержка
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
