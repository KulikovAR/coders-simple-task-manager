import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const AiAssistantSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    // Шаги для начала работы
    const aiFeatures = [
        {
            title: 'Регистрируйтесь за минуту',
            description: 'Быстрая регистрация без сложных форм. Сразу после регистрации вы получаете доступ к личному кабинету',
            icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
        },
        {
            title: 'Вставляете свои XML-ключи',
            description: 'Добавьте ключи от xmlriver.com или XMLstock в настройках. Поддержка нескольких аккаунтов одновременно',
            icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
        },
        {
            title: 'Вводите запросы и получайте данные',
            description: 'Вводите запросы и получайте данные в реальном времени. Создавайте отчеты, отслеживайте динамику позиций',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        }
    ];

    return (
        <section
            ref={sectionRef}
            id="ai-assistant"
            className="max-w-7xl mx-auto px-6 py-24 relative"
        >
            {/* Декоративный элемент */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/5 rounded-full blur-[120px] -z-10"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Левая колонка - Визуализация процесса */}
                <div className="order-2 lg:order-1">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-lg backdrop-blur-sm hover:shadow-xl hover:bg-black/60 hover:border-accent-purple/30 transition-all duration-300 hover:-translate-y-1.5">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-blue/20 text-accent-blue grid place-items-center text-lg font-bold flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-1">Регистрация</h3>
                                    <p className="text-gray-400 text-sm">Создайте аккаунт за минуту</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-purple/20 text-accent-purple grid place-items-center text-lg font-bold flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-1">Добавление ключей</h3>
                                    <p className="text-gray-400 text-sm">Вставьте XML-ключи в настройках</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 text-accent-cyan grid place-items-center text-lg font-bold flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-1">Начало работы</h3>
                                    <p className="text-gray-400 text-sm">Получайте данные в реальном времени</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Правая колонка - Описание возможностей */}
                <div className="order-1 lg:order-2">
                    <span className="bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-1.5 rounded-full text-xs font-semibold inline-block mb-4 text-white">КАК НАЧАТЬ</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                       Начните работу за минуту
                    </h2>
                    <p className="text-lg text-gray-300 mb-8">
                        Простой процесс регистрации и настройки. Всё, что нужно для начала работы с вашими XML-лимитами.
                    </p>

                    <div className="space-y-6 mb-8">
                        {aiFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-accent-purple/30 hover:bg-black/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue grid place-items-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-1 text-white hover:text-accent-blue transition-colors">{feature.title}</h3>
                                    <p className="text-gray-300 text-sm">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        href={route('seo-stats.dashboard')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-blue to-accent-purple text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300"
                    >
                        Создать аккаунт бесплатно
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Декоративный разделитель */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border-color/30 to-transparent my-24"></div>
        </section>
    );
};

export default AiAssistantSection;

