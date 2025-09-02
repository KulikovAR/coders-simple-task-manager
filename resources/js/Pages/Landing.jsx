import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
// import Waves from '@/Components/Waves';
import ApplicationLogo from '@/Components/ApplicationLogo';

// Компоненты лендинга
import HeroSection from '@/Components/Landing/HeroSection';
import FeaturesSection from '@/Components/Landing/FeaturesSection';
import AiAssistantSection from '@/Components/Landing/AiAssistantSection';
import ScreenshotsSection from '@/Components/Landing/ScreenshotsSection';
import BenefitsSection from '@/Components/Landing/BenefitsSection';
import PricingSection from '@/Components/Landing/PricingSection';
import CtaSection from '@/Components/Landing/CtaSection';
import Footer from '@/Components/Landing/Footer';

export default function Landing({ auth }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const sectionsRef = useRef({});

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.setAttribute('data-page', 'Landing');

        // Плавное появление страницы
        setTimeout(() => setIsLoaded(true), 100);

        // Настройка наблюдения за секциями для активного меню
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { threshold: 0.3 });

        // Наблюдение за всеми секциями
        Object.values(sectionsRef.current).forEach(section => {
            if (section) observer.observe(section);
        });

        return () => {
            document.body.removeAttribute('data-page');
            observer.disconnect();
        };
    }, []);

    const navClick = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsMobileMenuOpen(false);
        }
    };

    // Регистрация ссылки на секцию
    const registerSection = (id, ref) => {
        if (ref && !sectionsRef.current[id]) {
            sectionsRef.current[id] = ref;
        }
    };

    return (
        <>
            <Head>
                <title>379ТМ — Таск‑менеджер класса Pro с ИИ</title>
                <meta name="description" content="Проекты, спринты, канбан‑доска, теги, дедлайны, комментарии с упоминаниями, email и Telegram‑уведомления, webhook интеграции. Плюс ИИ‑ассистент, который всё делает по вашей команде." />
                <meta name="keywords" content="таск менеджер, управление проектами, спринты, канбан, ИИ ассистент, уведомления, Telegram, email" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="379ТМ — Таск‑менеджер класса Pro с ИИ" />
                <meta property="og:description" content="Проекты, спринты, канбан, теги, дедлайны, комментарии, webhook интеграции и ИИ‑ассистент." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content="/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="379ТМ — Таск‑менеджер класса Pro с ИИ" />
                <meta name="twitter:description" content="Проекты, спринты, канбан, теги, дедлайны, комментарии, webhook интеграции и ИИ‑ассистент." />
                <meta name="twitter:image" content="/og-image.jpg" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0a0a0a" />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "379ТМ",
                        "description": "Таск‑менеджер класса Pro с ИИ. Проекты, спринты, канбан, теги, дедлайны, уведомления и webhook интеграции.",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RUB" }
                    })}
                </script>
            </Head>

            <div className="min-h-screen bg-black text-text-primary relative overflow-hidden">
                {/* Навигация */}
                <header className={`fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <nav className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-9 w-auto" />
                            </div>
                            <div className="hidden md:flex items-center gap-8 text-sm">
                                <button
                                    onClick={() => navClick('features')}
                                    className={`${activeSection === 'features' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-accent-blue after:transition-all after:duration-300 ${activeSection === 'features' ? 'after:w-full' : 'after:w-0'} hover:after:w-full`}
                                >
                                    Возможности
                                </button>
                                <button
                                    onClick={() => navClick('screenshots')}
                                    className={`${activeSection === 'screenshots' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-accent-blue after:transition-all after:duration-300 ${activeSection === 'screenshots' ? 'after:w-full' : 'after:w-0'} hover:after:w-full`}
                                >
                                    Интерфейс
                                </button>
                                <button
                                    onClick={() => navClick('ai-assistant')}
                                    className={`${activeSection === 'ai-assistant' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-accent-blue after:transition-all after:duration-300 ${activeSection === 'ai-assistant' ? 'after:w-full' : 'after:w-0'} hover:after:w-full`}
                                >
                                    ИИ‑ассистент
                                </button>
                                <button
                                    onClick={() => navClick('benefits')}
                                    className={`${activeSection === 'benefits' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-accent-blue after:transition-all after:duration-300 ${activeSection === 'benefits' ? 'after:w-full' : 'after:w-0'} hover:after:w-full`}
                                >
                                    Преимущества
                                </button>
                                <button
                                    onClick={() => navClick('pricing')}
                                    className={`${activeSection === 'pricing' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-accent-blue after:transition-all after:duration-300 ${activeSection === 'pricing' ? 'after:w-full' : 'after:w-0'} hover:after:w-full`}
                                >
                                    Тарифы
                                </button>
                                <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all duration-300">
                                    Поддержка
                                </a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300 transform hover:-translate-y-0.5">
                                        Открыть дашборд
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Link href={route('login')} className="text-white hover:text-accent-blue transition-all duration-300">
                                            Вход
                                        </Link>
                                        <Link href={route('register')} className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300 transform hover:-translate-y-0.5">
                                            Начать
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden w-10 h-10 grid place-items-center rounded-lg border border-border-color/50 hover:border-accent-blue/50 hover:bg-accent-blue/10 transition-all duration-300"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                                </svg>
                            </button>
                        </div>
                        {isMobileMenuOpen && (
                            <div className="md:hidden mt-4 pt-4 border-t border-border-color/30 flex flex-col gap-5">
                                <button onClick={() => navClick('features')} className={`text-left ${activeSection === 'features' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300`}>
                                    Возможности
                                </button>
                                <button onClick={() => navClick('ai-assistant')} className={`text-left ${activeSection === 'ai-assistant' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300`}>
                                    ИИ‑ассистент
                                </button>
                                <button onClick={() => navClick('screenshots')} className={`text-left ${activeSection === 'screenshots' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300`}>
                                    Интерфейс
                                </button>
                                <button onClick={() => navClick('benefits')} className={`text-left ${activeSection === 'benefits' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300`}>
                                    Преимущества
                                </button>
                                <button onClick={() => navClick('pricing')} className={`text-left ${activeSection === 'pricing' ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-all duration-300`}>
                                    Тарифы
                                </button>
                                <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all duration-300">
                                    Поддержка
                                </a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-5 py-2.5 rounded-lg font-medium text-center hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300">
                                        Открыть дашборд
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <Link href={route('login')} className="text-white hover:text-accent-blue transition-all duration-300">
                                            Вход
                                        </Link>
                                        <Link href={route('register')} className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-5 py-2.5 rounded-lg font-medium text-center hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300">
                                            Начать
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </header>

                <main className="relative pt-24">
                    {/* Героическая секция */}
                    <HeroSection
                        isLoaded={isLoaded}
                        auth={auth}
                        registerRef={(ref) => registerSection('hero', ref)}
                    />

                    {/* Секция возможностей */}
                    <FeaturesSection
                        registerRef={(ref) => registerSection('features', ref)}
                    />

                    {/* Секция скриншотов */}
                    <ScreenshotsSection
                        registerRef={(ref) => registerSection('screenshots', ref)}
                    />

                    {/* Секция ИИ-ассистента */}
                    <AiAssistantSection
                        registerRef={(ref) => registerSection('ai-assistant', ref)}
                    />

                    {/* Секция преимуществ */}
                    <BenefitsSection
                        registerRef={(ref) => registerSection('benefits', ref)}
                    />

                    {/* Секция тарифов */}
                    <PricingSection
                        registerRef={(ref) => registerSection('pricing', ref)}
                    />
                </main>

                {/* Футер */}
                <Footer />
            </div>
        </>
    );
}
