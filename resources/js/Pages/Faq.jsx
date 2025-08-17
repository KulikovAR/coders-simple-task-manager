import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Faq() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <>
            <Head>
                <title>FAQ - Часто задаваемые вопросы | 379ТМ</title>
                <meta name="description" content="Ответы на вопросы о системе управления задачами 379ТМ и ИИ-ассистенте. Как работает система, безопасность, команды." />
                <meta name="keywords" content="FAQ, вопросы, помощь, поддержка, 379ТМ, управление задачами" />
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph */}
                <meta property="og:title" content="FAQ - Часто задаваемые вопросы | 379ТМ" />
                <meta property="og:description" content="Ответы на вопросы о системе управления задачами 379ТМ и ИИ-ассистенте. Как работает система, безопасность, команды." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="FAQ - Часто задаваемые вопросы | 379ТМ" />
                <meta name="twitter:description" content="Ответы на вопросы о системе управления задачами 379ТМ и ИИ-ассистенте." />
                
                {/* Структурированные данные */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Что такое 379ТМ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "379ТМ - это современная система управления задачами, специально разработанная и команд. Она включает в себя уникальный ИИ-ассистент, который позволяет управлять проектами и задачами на естественном языке."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Как работает ИИ-ассистент?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "ИИ-ассистент понимает команды на русском языке и автоматически выполняет действия в системе. Например, вы можете сказать 'Создай новый проект Веб-сайт' или 'Назначь задачу Исправить баг на меня', и система выполнит эти команды автоматически."
                                }
                            }
                        ]
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

                <main className="max-w-4xl mx-auto px-6 py-20">
                    {/* Hero Section */}
                    <div className={`text-center mb-20 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight">
                            FAQ
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                            Ответы на вопросы о системе управления задачами 379ТМ и ИИ-ассистенте
                        </p>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-8">
                        {[
                            {
                                question: "Что такое 379ТМ?",
                                answer: "379ТМ - это современная система управления задачами, специально разработанная для команд. Она включает в себя уникальный ИИ-ассистент, который позволяет управлять проектами и задачами на естественном языке."
                            },
                            {
                                question: "Как работает ИИ-ассистент?",
                                answer: "ИИ-ассистент понимает команды на русском языке и автоматически выполняет действия в системе. Например, вы можете сказать 'Создай новый проект Веб-сайт' или 'Назначь задачу Исправить баг на меня', и система выполнит эти команды автоматически."
                            },
                            {
                                question: "Безопасны ли мои данные?",
                                answer: "Да, безопасность данных - наш приоритет. Все данные шифруются, используется современная аутентификация, и система соответствует стандартам безопасности. Ваши проекты и задачи доступны только вам и вашей команде."
                            },
                            {
                                question: "Можно ли использовать систему бесплатно?",
                                answer: "Да, 379ТМ доступна бесплатно для всех пользователей. При этом ИИ-ассистент создаст до 9 задач/месяц в бесплатной версии."
                            },
                            {
                                question: "Поддерживается ли командная работа?",
                                answer: "Конечно! Вы можете приглашать участников в проекты, назначать им задачи, отслеживать прогресс и общаться через систему комментариев. ИИ-ассистент также помогает в управлении командой."
                            },
                            {
                                question: "Какие команды понимает ИИ-ассистент?",
                                answer: "ИИ-ассистент понимает множество команд: создание и управление проектами, создание и назначение задач, обновление статусов, создание спринтов, получение статистики и многое другое. Просто опишите, что вы хотите сделать, на естественном языке."
                            },
                            {
                                question: "Есть ли мобильная версия?",
                                answer: "Система полностью адаптивна и отлично работает на мобильных устройствах. Вы можете управлять задачами с любого устройства через веб-браузер."
                            },
                            {
                                question: "Как получить поддержку?",
                                answer: "Если у вас есть вопросы или проблемы, вы можете обратиться к нашей команде поддержки. Мы стремимся помочь вам максимально эффективно использовать систему."
                            }
                        ].map((item, index) => (
                            <div key={index} className={`bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 delay-${index * 100} hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-gray-200 transition-colors duration-300">{item.question}</h3>
                                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{item.answer}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className={`text-center mt-20 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8">
                            Не нашли ответ?
                        </h2>
                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            Если у вас есть вопросы, обращайтесь к нам
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                href="/register"
                                className="bg-blue-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                            >
                                Попробовать бесплатно
                            </Link>
                            <Link
                                href="/ai-features"
                                className="border border-white/20 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                            >
                                Узнать об ИИ-ассистенте
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
                                <Link href="/ai-features" className="text-gray-400 hover:text-white transition-colors duration-300">
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