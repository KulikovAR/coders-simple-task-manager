import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogoSeo.jsx';

// Компоненты лендинга
import HeroSection from '@/Components/SeoLanding/HeroSection';
import FeaturesSection from '@/Components/SeoLanding/FeaturesSection';
import AiAssistantSection from '@/Components/SeoLanding/AiAssistantSection';
import BenefitsSection from '@/Components/SeoLanding/BenefitsSection';
import Footer from '@/Components/SeoLanding/Footer';
import YandexMetrika from '@/Components/YandexMetrika';

export default function SeoLanding({ auth }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const sectionsRef = useRef({});

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-page', 'Landing');

        setTimeout(() => setIsLoaded(true), 100);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { threshold: 0.3 });

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
                <meta name="theme-color" content="#ffffff" />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
            </Head>

            <div className="min-h-screen bg-white text-black">
                <YandexMetrika />

                {/* Навигация в стиле Rocketbank - минималистичная */}
                <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <nav className="max-w-6xl mx-auto px-6 py-6">
                        <div className="flex items-center justify-between">
                            <ApplicationLogo className="h-8 w-auto text-black" />
                            
                            <div className="hidden md:flex items-center gap-10">
                                <button
                                    onClick={() => navClick('features')}
                                    className={`text-sm ${activeSection === 'features' ? 'text-black font-medium' : 'text-gray-500'} hover:text-black transition-colors`}
                                >
                                    Возможности
                                </button>
                                <button
                                    onClick={() => navClick('ai-assistant')}
                                    className={`text-sm ${activeSection === 'ai-assistant' ? 'text-black font-medium' : 'text-gray-500'} hover:text-black transition-colors`}
                                >
                                    Как это работает
                                </button>
                                <button
                                    onClick={() => navClick('benefits')}
                                    className={`text-sm ${activeSection === 'benefits' ? 'text-black font-medium' : 'text-gray-500'} hover:text-black transition-colors`}
                                >
                                    Преимущества
                                </button>
                                {auth.user ? (
                                    <Link href={route('seo-stats.dashboard')} className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors !text-white">
                                        <span className="!text-white">Открыть дашборд</span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Link href={route('login')} className="text-sm text-gray-500 hover:text-black transition-colors">
                                            Вход
                                        </Link>
                                        <Link href={route('register')} className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors !text-white">
                                            <span className="!text-white">Начать</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden w-8 h-8 grid place-items-center"
                            >
                                <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                                </svg>
                            </button>
                        </div>
                        
                        {isMobileMenuOpen && (
                            <div className="md:hidden mt-6 pt-6 border-t border-gray-200 flex flex-col gap-4">
                                <button onClick={() => navClick('features')} className="text-left text-sm text-gray-500 hover:text-black transition-colors">
                                    Возможности
                                </button>
                                <button onClick={() => navClick('ai-assistant')} className="text-left text-sm text-gray-500 hover:text-black transition-colors">
                                    Как это работает
                                </button>
                                <button onClick={() => navClick('benefits')} className="text-left text-sm text-gray-500 hover:text-black transition-colors">
                                    Преимущества
                                </button>
                                {auth.user ? (
                                    <Link href={route('seo-stats.dashboard')} className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium text-center mt-2 !text-white">
                                        <span className="!text-white">Открыть дашборд</span>
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-3 mt-2">
                                        <Link href={route('login')} className="text-sm text-gray-500 hover:text-black transition-colors">
                                            Вход
                                        </Link>
                                        <Link href={route('register')} className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium text-center hover:bg-gray-800 transition-colors !text-white">
                                            <span className="!text-white">Начать</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </header>

                <main className="relative">
                    <HeroSection
                        isLoaded={isLoaded}
                        auth={auth}
                        registerRef={(ref) => registerSection('hero', ref)}
                    />

                    <FeaturesSection
                        registerRef={(ref) => registerSection('features', ref)}
                    />

                    <AiAssistantSection
                        registerRef={(ref) => registerSection('ai-assistant', ref)}
                    />

                    <BenefitsSection
                        registerRef={(ref) => registerSection('benefits', ref)}
                    />
                </main>

                <Footer />
            </div>
        </>
    );
}
