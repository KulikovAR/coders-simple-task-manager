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
            className="max-w-6xl mx-auto px-6 pt-40 pb-32"
        >
            <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Главный заголовок - крупный и простой */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-black mb-8 max-w-5xl">
                    используйте свои XML-лимиты как полноценный веб-сервис
                </h1>

                {/* Подзаголовок - простой и понятный */}
                <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl leading-relaxed font-light">
                    Экономьте до 80% на мониторинге позиций. Быстро, просто, онлайн.
                </p>

                {/* Описание */}
                <p className="text-lg text-gray-500 mb-16 max-w-2xl leading-relaxed">
                    Ваши ключи от xmlriver.com и XMLstock — в руках профессионала. Создайте личный кабинет и получайте актуальные данные без установки парсеров и сложных скриптов.
                </p>

                {/* Кнопки - простые и четкие */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-24">
                    {auth.user ? (
                        <Link
                            href={route('seo-stats.dashboard')}
                            className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors text-lg !text-white"
                        >
                            <span className="!text-white">Открыть дашборд</span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('seo-stats.dashboard')}
                                className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors text-lg !text-white"
                            >
                                <span className="!text-white">Начать бесплатно</span>
                            </Link>
                            <Link
                                href={route('seo-stats.dashboard')}
                                className="px-8 py-4 rounded-full font-medium border-2 border-black hover:bg-black hover:!text-white transition-colors text-lg"
                            >
                                <span className="hover:!text-white">Войти в аккаунт</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Изображение - простое, без лишних эффектов */}
                <div className="relative mt-20">
                    <img
                        src="/images/landing/hero-main-seo.png"
                        alt="Главный скриншот интерфейса"
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
