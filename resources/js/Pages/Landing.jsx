import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import Waves from '@/Components/Waves';
import ApplicationLogo from '@/Components/ApplicationLogo';

// Компоненты лендинга
import HeroSection from '@/Components/Landing/HeroSection';
import FeaturesSection from '@/Components/Landing/FeaturesSection';
import AiAssistantSection from '@/Components/Landing/AiAssistantSection';
import ScreenshotsSection from '@/Components/Landing/ScreenshotsSection';
import BenefitsSection from '@/Components/Landing/BenefitsSection';
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
                <meta name="description" content="Проекты, спринты, канбан‑доска, теги, дедлайны, комментарии с упоминаниями, email и Telegram‑уведомления. Плюс ИИ‑ассистент, который всё делает по вашей команде." />
                <meta name="keywords" content="таск менеджер, управление проектами, спринты, канбан, ИИ ассистент, уведомления, Telegram, email" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="379ТМ — Таск‑менеджер класса Pro с ИИ" />
                <meta property="og:description" content="Проекты, спринты, канбан, теги, дедлайны, комментарии и ИИ‑ассистент." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content="/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="379ТМ — Таск‑менеджер класса Pro с ИИ" />
                <meta name="twitter:description" content="Проекты, спринты, канбан, теги, дедлайны, комментарии и ИИ‑ассистент." />
                <meta name="twitter:image" content="/og-image.jpg" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0a0a0a" />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "379ТМ",
                        "description": "Таск‑менеджер класса Pro с ИИ. Проекты, спринты, канбан, теги, дедлайны и уведомления.",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RUB" }
                    })}
                </script>
            </Head>

            <div className="min-h-screen bg-primary-bg text-text-primary relative overflow-hidden">
                {/* Интерактивный фон с волнами */}
                <Waves
                    lineColor="rgba(255, 255, 255, 0.03)"
                    backgroundColor="transparent"
                    waveSpeedX={0.008}
                    waveSpeedY={0.004}
                    waveAmpX={20}
                    waveAmpY={10}
                    xGap={24}
                    yGap={48}
                    friction={0.96}
                    tension={0.004}
                    maxCursorMove={80}
                    style={{ zIndex: 0 }}
                />

                {/* Навигация */}
                <header className={`fixed top-0 left-0 right-0 z-50 bg-primary-bg/80 backdrop-blur-xl border-b border-border-color transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <nav className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-8 w-auto" />
                            </div>
                            <div className="hidden md:flex items-center gap-8 text-sm">
                                <button
                                    onClick={() => navClick('features')}
                                    className={`${activeSection === 'features' ? 'text-text-primary' : 'text-text-secondary'} hover:text-text-primary transition-colors`}
                                >
                                    Возможности
                                </button>
                                <button
                                    onClick={() => navClick('ai-assistant')}
                                    className={`${activeSection === 'ai-assistant' ? 'text-text-primary' : 'text-text-secondary'} hover:text-text-primary transition-colors`}
                                >
                                    ИИ‑ассистент
                                </button>
                                <button
                                    onClick={() => navClick('screenshots')}
                                    className={`${activeSection === 'screenshots' ? 'text-text-primary' : 'text-text-secondary'} hover:text-text-primary transition-colors`}
                                >
                                    Интерфейс
                                </button>
                                <button
                                    onClick={() => navClick('benefits')}
                                    className={`${activeSection === 'benefits' ? 'text-text-primary' : 'text-text-secondary'} hover:text-text-primary transition-colors`}
                                >
                                    Преимущества
                                </button>
                                <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">
                                    Поддержка
                                </a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="bg-accent-blue text-white px-4 py-2 rounded-full font-medium hover:bg-accent-blue/80 transition-colors shadow-glow">
                                        Открыть дашборд
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link href={route('login')} className="text-text-primary hover:text-text-secondary transition-colors">
                                            Вход
                                        </Link>
                                        <Link href={route('register')} className="bg-accent-blue text-white px-4 py-2 rounded-full font-medium hover:bg-accent-blue/80 transition-colors shadow-glow">
                                            Начать
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden w-10 h-10 grid place-items-center rounded-lg border border-border-color hover:bg-secondary-bg transition-colors"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                                </svg>
                            </button>
                        </div>
                        {isMobileMenuOpen && (
                            <div className="md:hidden mt-4 pt-4 border-t border-border-color flex flex-col gap-4">
                                <button onClick={() => navClick('features')} className="text-left text-text-secondary hover:text-text-primary">
                                    Возможности
                                </button>
                                <button onClick={() => navClick('ai-assistant')} className="text-left text-text-secondary hover:text-text-primary">
                                    ИИ‑ассистент
                                </button>
                                <button onClick={() => navClick('screenshots')} className="text-left text-text-secondary hover:text-text-primary">
                                    Интерфейс
                                </button>
                                <button onClick={() => navClick('benefits')} className="text-left text-text-secondary hover:text-text-primary">
                                    Преимущества
                                </button>
                                <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary">
                                    Поддержка
                                </a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="bg-accent-blue text-white px-4 py-2 rounded-full text-center shadow-glow">
                                        Открыть дашборд
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href={route('login')} className="text-text-primary">
                                            Вход
                                        </Link>
                                        <Link href={route('register')} className="bg-accent-blue text-white px-4 py-2 rounded-full text-center shadow-glow">
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

                    {/* Секция ИИ-ассистента */}
                    <AiAssistantSection
                        registerRef={(ref) => registerSection('ai-assistant', ref)}
                    />

                    {/* Секция скриншотов */}
                    <ScreenshotsSection
                        registerRef={(ref) => registerSection('screenshots', ref)}
                    />

                    {/* Секция преимуществ */}
                    <BenefitsSection
                        registerRef={(ref) => registerSection('benefits', ref)}
                    />

                    {/* Секция призыва к действию */}
                    <CtaSection
                        auth={auth}
                        registerRef={(ref) => registerSection('cta', ref)}
                    />
                </main>

                {/* Футер */}
                <Footer />
            </div>
        </>
    );
}
