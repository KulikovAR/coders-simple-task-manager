import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome({ auth }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <>
            <Head>
                <title>379ТМ - Управление задачами с ИИ-ассистентом для разработчиков</title>
                <meta name="description" content="Система управления задачами для разработчиков. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат." />
                <meta name="keywords" content="управление задачами, таск менеджер, ИИ ассистент, управление проектами, спринты, разработка, команда, продуктивность" />
                <meta name="author" content="379ТМ" />
                <meta name="robots" content="index, follow" />

                {/* Open Graph */}
                <meta property="og:title" content="379ТМ - Управление задачами с ИИ-ассистентом" />
                <meta property="og:description" content="Система управления задачами для разработчиков. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="/og-image.jpg" />
                <meta property="og:site_name" content="379ТМ" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="379ТМ - Управление задачами с ИИ-ассистентом" />
                <meta name="twitter:description" content="Система управления задачами для разработчиков. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат." />
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
                        "description": "Система управления задачами для разработчиков. Создавайте проекты, планируйте спринты, назначайте задачи. ИИ-ассистент помогает управлять всем через чат.",
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

            <div className="min-h-screen bg-black text-white">
                {/* Header */}
                <header className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <nav className="max-w-6xl mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="text-2xl font-semibold text-white">
                                379ТМ
                            </div>
                            <div className="flex space-x-8">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-white hover:text-gray-300 transition-colors font-medium"
                                    >
                                        Дашборд
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-white hover:text-gray-300 transition-colors font-medium"
                                        >
                                            Вход
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
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
                <main className="pt-24">
                    {/* Hero Section */}
                    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                        <div className={`mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <span className="inline-block bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
                                ИИ-ассистент включен
                            </span>
                        </div>

                        <h1 className={`text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Управление задачами
                            <br />
                            <span className="text-gray-400">с ИИ-ассистентом</span>
                        </h1>

                        <p className={`text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Система управления задачами для разработчиков. Создавайте проекты, планируйте спринты,
                            назначайте задачи и отслеживайте прогресс. ИИ-ассистент помогает управлять всем через чат.
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {!auth.user ? (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Начать бесплатно
                                    </Link>
                                    <Link
                                        href={route('ai-features')}
                                        className="border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Узнать больше
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                >
                                    Перейти в дашборд
                                </Link>
                            )}
                        </div>

                        {/* Stats */}
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 max-w-2xl mx-auto transition-all duration-1000 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {[
                                { number: "10,000+", label: "Активных пользователей" },
                                { number: "50,000+", label: "Выполненных задач" },
                                { number: "24/7", label: "Доступность системы" }
                            ].map((stat, index) => (
                                <div key={index} className="text-center group">
                                    <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="max-w-6xl mx-auto px-6 py-20">
                        <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Возможности платформы
                            </h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
                                    title: "Agile спринты",
                                    description: "Планируйте спринты и отслеживайте их выполнение"
                                },
                                {
                                    icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                                    title: "Детальные задачи",
                                    description: "Создавайте задачи, назначайте исполнителей и добавляйте комментарии"
                                }
                            ].map((feature, index) => (
                                <div key={index} className={`text-center group transition-all duration-1000 delay-${500 + index * 100} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                        <svg className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={feature.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-gray-200 transition-colors duration-300">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* AI Assistant Section */}
                    <section className="max-w-6xl mx-auto px-6 py-20">
                        <div className={`bg-white/5 rounded-3xl p-12 md:p-16 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                    ИИ-ассистент
                                </h2>
                                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                    Управляйте проектами через чат. Пишите команды на русском языке,
                                    и система автоматически создаст проекты, задачи и спринты.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    {[
                                        'Создай новый проект "Веб-сайт"',
                                        'Назначь задачу "Исправить баг" на меня',
                                        'Покажи статистику по проектам',
                                        'Создай спринт на следующую неделю'
                                    ].map((command, index) => (
                                        <div key={index} className={`bg-black/50 border border-white/10 p-6 rounded-2xl transition-all duration-500 delay-${index * 100} hover:bg-black/70 hover:border-white/20 hover:scale-105 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                                            <div className="text-white text-sm mb-2">{command}</div>
                                            <div className="text-gray-400 text-sm">ИИ-ассистент выполнит команду автоматически</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className={`relative transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                        <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                                            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Готовы начать?
                        </h2>
                        <p className={`text-xl text-gray-400 mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Присоединяйтесь к разработчикам, которые уже используют 379ТМ для управления проектами
                        </p>
                        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {!auth.user ? (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="bg-white text-black px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Начать бесплатно
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="border-2 border-white text-white bg-transparent px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                    >
                                        Войти в систему
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-white text-black px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-w-[180px] text-center"
                                >
                                    Перейти в дашборд
                                </Link>
                            )}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className={`border-t border-white/10 py-12 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-gray-400 mb-4 md:mb-0">
                                © 2025 379ТМ. Создано для разработчиков
                            </div>
                            <div className="flex space-x-8">
                                <Link href={route('faq')} className="text-gray-400 hover:text-white transition-colors duration-300">
                                    FAQ
                                </Link>
                                <Link href={route('ai-features')} className="text-gray-400 hover:text-white transition-colors duration-300">
                                    ИИ-ассистент
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
