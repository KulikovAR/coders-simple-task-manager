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
            className="max-w-7xl mx-auto px-6 py-24"
        >
            <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Декоративные элементы */}
                <div className="absolute top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute top-48 left-1/4 w-32 h-32 bg-accent-purple/10 rounded-full blur-[80px] -z-10"></div>
                <div className="absolute top-48 right-1/4 w-32 h-32 bg-accent-cyan/10 rounded-full blur-[80px] -z-10"></div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white mb-6">
                    Просто удобный <br/>
                    <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent">
                        таск-менеджер
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Проекты, спринты, канбан-доска, теги, дедлайны, комментарии с упоминаниями, мгновенные уведомления в Email и Telegram, webhook интеграции. С ИИ-ассистентом, который всё делает по команде.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-accent-blue/20 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            Открыть дашборд
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('register')}
                                className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-accent-blue/20 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                            >
                                Начать бесплатно
                            </Link>
                            <Link
                                href={route('login')}
                                className="px-8 py-4 rounded-xl font-semibold border border-border-color/50 hover:border-accent-blue/50 hover:bg-accent-blue/10 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                            >
                                Войти в аккаунт
                            </Link>
                        </>
                    )}
                </div>

                {/* Изображение с эффектом */}
                <div className="relative mt-12 overflow-hidden" style={{ transform: "matrix3d(1, -0.2, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)" }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                        <img src="/images/landing/hero-main.png" alt="Главный скриншот интерфейса" className="w-full h-auto object-cover" />
                </div>

                {/* Индикатор скролла */}
                <div className="mt-12 flex justify-center animate-bounce">
                    <div className="w-10 h-10 rounded-full border border-border-color/50 flex items-center justify-center group hover:border-accent-blue/50 hover:bg-accent-blue/10 transition-all duration-300 cursor-pointer">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
