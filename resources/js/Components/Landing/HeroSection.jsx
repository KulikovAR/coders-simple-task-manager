import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const HeroSection = ({ isLoaded, auth, registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="max-w-7xl mx-auto px-6 py-12 md:py-20"
        >
            <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h1 className="text-3xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight text-white mb-4">
                    Таск-менеджер <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                        на новом уровне
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mt-4 max-w-3xl mx-auto">
                    Проекты, спринты, канбан-доска, теги, дедлайны, комментарии с упоминаниями и мгновенные уведомления в Email и Telegram. С ИИ-ассистентом, который всё делает по команде.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="bg-accent-blue text-white px-8 py-4 rounded-xl font-semibold hover:bg-accent-blue/90 transition-all duration-300 shadow-glow transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            Открыть дашборд
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('register')}
                                className="bg-accent-blue text-white px-8 py-4 rounded-xl font-semibold hover:bg-accent-blue/90 transition-all duration-300 shadow-glow transform hover:-translate-y-1 w-full sm:w-auto"
                            >
                                Начать бесплатно
                            </Link>
                            <Link
                                href={route('login')}
                                className="px-8 py-4 rounded-xl font-semibold border border-border-color hover:bg-secondary-bg transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                            >
                                Войти в аккаунт
                            </Link>
                        </>
                    )}
                </div>

                {/* Изображение на всю ширину экрана */}
                <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 mt-12 px-[56px]">
                    {/* Замените hero-main.png на ваш главный скриншот. Путь: public/images/landing/hero-main.png */}
                    <img src="/images/landing/hero-main.png" alt="Главный скриншот интерфейса" className="w-full h-auto object-cover shadow-xl" />
                </div>

                {/* Индикатор скролла */}
                <div className="mt-10 flex justify-center animate-bounce">
                    <svg className="w-6 h-6 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
