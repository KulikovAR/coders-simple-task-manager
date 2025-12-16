import React, { useRef, useEffect } from 'react';

const FeaturesSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    const features = [
        {
            title: 'Актуальные позиции',
            description: 'Получайте актуальные позиции по ключам и доменам в реальном времени',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        },
        {
            title: 'Отчеты и графики',
            description: 'Создавайте отчеты и графики в один клик для визуализации данных',
            icon: 'M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        },
        {
            title: 'История и динамика',
            description: 'Храните историю и отслеживайте динамику позиций по всем вашим запросам',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            title: 'Экономия и скорость',
            description: 'Экономьте деньги и ускоряйте работу без установки парсеров и сложных скриптов',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        },
    ];

    return (
        <section
            ref={sectionRef}
            id="features"
            className="max-w-6xl mx-auto px-6 py-32"
        >
            {/* Заголовок секции */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-16 max-w-4xl leading-tight">
                CRM-система для работы с XML-лимитами — как полноценный сервис для SEO
            </h2>
            
            <p className="text-xl text-gray-600 mb-20 max-w-2xl leading-relaxed">
                Просто в личном кабинете вставляете ваши XML-ключи и управляете запросами — всё онлайн:
            </p>

            {/* Список функций - простой и чистый */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {features.map((feature, index) => (
                    <div key={index} className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black flex items-center justify-center">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-black mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;
