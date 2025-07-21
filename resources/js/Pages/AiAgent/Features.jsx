import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AiFeatures() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <>
            <Head>
                <title>ИИ-ассистент - 379ТМ</title>
                <meta name="description" content="Управляйте проектами через чат. Пишите команды на русском языке, и система автоматически создаст проекты, задачи и спринты." />
                <meta name="keywords" content="ИИ ассистент, искусственный интеллект, управление задачами, автоматизация, естественный язык" />
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph */}
                <meta property="og:title" content="ИИ-ассистент - 379ТМ" />
                <meta property="og:description" content="Управляйте проектами через чат. Пишите команды на русском языке, и система автоматически создаст проекты, задачи и спринты." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="ИИ-ассистент - 379ТМ" />
                <meta name="twitter:description" content="Управляйте проектами через чат. Пишите команды на русском языке, и система автоматически создаст проекты, задачи и спринты." />
                
                {/* Структурированные данные */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "379ТМ ИИ-ассистент",
                        "description": "Управляйте проектами через чат. Пишите команды на русском языке, и система автоматически создаст проекты, задачи и спринты.",
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
                <header className={`border-b border-white/10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <nav className="max-w-6xl mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <Link href="/" className="text-2xl font-semibold text-white hover:text-gray-300 transition-colors duration-300">
                                379ТМ
                            </Link>
                            <Link
                                href="/"
                                className="text-white hover:text-gray-300 transition-colors duration-300 font-medium"
                            >
                                На главную
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-20">
                    {/* Hero Section */}
                    <div className={`text-center mb-20 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight">
                            ИИ-ассистент
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                            Управляйте проектами через чат. Пишите команды на русском языке, 
                            и система автоматически создаст проекты, задачи и спринты.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
                        {[
                            {
                                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                                title: "Естественный язык",
                                description: "Пишите команды на русском языке как в обычном чате"
                            },
                            {
                                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                                title: "Мгновенное выполнение",
                                description: "Команды выполняются сразу после отправки"
                            },
                            {
                                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                                title: "Умная аналитика",
                                description: "Получайте отчеты по проектам и задачам"
                            },
                            {
                                icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4",
                                title: "Автоматизация",
                                description: "Автоматически создавайте задачи и назначайте исполнителей"
                            },
                            {
                                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                                title: "Командная работа",
                                description: "Добавляйте участников и распределяйте задачи"
                            },
                            {
                                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                                title: "Безопасность",
                                description: "Все команды выполняются с учетом прав доступа"
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

                    {/* Commands Examples */}
                    <div className="mb-20">
                        <h2 className={`text-4xl md:text-5xl font-bold text-center mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Примеры команд
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold text-white mb-8">Управление проектами</h3>
                                {[
                                    'Создай новый проект "Веб-сайт компании"',
                                    'Покажи все мои проекты',
                                    'Переименуй проект "Старый проект" в "Новый проект"',
                                    'Удали проект "Тестовый проект"',
                                    'Добавь участника john@example.com в проект "Веб-сайт"'
                                ].map((command, index) => (
                                    <div key={index} className={`bg-white/5 border border-white/10 p-6 rounded-2xl transition-all duration-500 delay-${index * 100} hover:bg-white/10 hover:border-white/20 hover:scale-105 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                                        <div className="text-white text-sm mb-2">{command}</div>
                                        <div className="text-gray-400 text-sm">ИИ автоматически выполнит команду</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold text-white mb-8">Управление задачами</h3>
                                {[
                                    'Создай задачу "Исправить баг в форме"',
                                    'Назначь задачу "Дизайн главной страницы" на меня',
                                    'Обнови статус задачи "Тестирование" на "В работе"',
                                    'Покажи все задачи в проекте "Веб-сайт"',
                                    'Добавь комментарий "Исправлено" к задаче "Баг #123"'
                                ].map((command, index) => (
                                    <div key={index} className={`bg-white/5 border border-white/10 p-6 rounded-2xl transition-all duration-500 delay-${index * 100} hover:bg-white/10 hover:border-white/20 hover:scale-105 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                        <div className="text-white text-sm mb-2">{command}</div>
                                        <div className="text-gray-400 text-sm">ИИ автоматически выполнит команду</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Готовы попробовать?
                        </h2>
                        <p className={`text-xl text-gray-400 mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Присоединяйтесь к разработчикам, которые уже используют ИИ-ассистент для управления проектами
                        </p>
                        <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <Link
                                href="/register"
                                className="bg-white text-black px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                            >
                                Начать бесплатно
                            </Link>
                            <Link
                                href="/"
                                className="border border-white/20 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                            >
                                На главную
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className={`border-t border-white/10 py-12 mt-20 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-gray-400 mb-4 md:mb-0">
                                © 2025 379ТМ. Создано для профессионалов
                            </div>
                            <div className="flex space-x-8">
                                <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Главная
                                </Link>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    FAQ
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
} 