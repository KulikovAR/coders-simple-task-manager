import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const CtaSection = ({ auth, registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    return (
        <section
            ref={sectionRef}
            id="cta"
            className="max-w-7xl mx-auto px-6 py-8"
        >

            {/* Для кого */}
            <div className="mt-24">
                <div className="text-center mb-16">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-full text-xs font-bold inline-block mb-6 text-white tracking-wide uppercase">Для кого</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                        Кому подходит наш сервис
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white grid place-items-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">SEO-специалисты и агентства</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Профессиональный мониторинг позиций для ваших клиентов с удобной системой отчетности
                        </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white grid place-items-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Вебмастера и владельцы сайтов</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Отслеживайте позиции вашего сайта и анализируйте динамику без лишних затрат
                        </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white grid place-items-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Профессионалы с XML-лимитами</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Любые специалисты, использующие XML-лимиты для анализа и мониторинга позиций
                        </p>
                    </div>
                </div>

                {/* Призыв к действию */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-16 text-center hover:border-blue-300 transition-all duration-300 shadow-xl">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                        Переведите XML-лимиты в полноценный инструмент для мониторинга
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Регистрируйтесь и начинайте работать быстрее, проще и дешевле!
                    </p>
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 text-lg !text-white"
                        >
                            <span className="!text-white">Открыть дашборд</span>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href={route('register')}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 text-lg !text-white"
                        >
                            <span className="!text-white">Создать аккаунт бесплатно</span>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CtaSection;
