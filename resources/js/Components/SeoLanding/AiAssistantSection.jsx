import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const AiAssistantSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    const steps = [
        {
            number: '01',
            title: 'Регистрируйтесь за минуту',
            description: 'Быстрая регистрация без сложных форм. Сразу после регистрации вы получаете доступ к личному кабинету',
        },
        {
            number: '02',
            title: 'Вставляете свои XML-ключи',
            description: 'Добавьте ключи от xmlriver.com или XMLstock в настройках. Поддержка нескольких аккаунтов одновременно',
        },
        {
            number: '03',
            title: 'Вводите запросы и получайте данные',
            description: 'Вводите запросы и получайте данные в реальном времени. Создавайте отчеты, отслеживайте динамику позиций',
        }
    ];

    return (
        <section
            ref={sectionRef}
            id="ai-assistant"
            className="max-w-6xl mx-auto px-6 py-32"
        >
            {/* Заголовок */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-16 max-w-4xl leading-tight">
                Начните работу за минуту
            </h2>
            
            <p className="text-xl text-gray-600 mb-20 max-w-2xl leading-relaxed">
                Простой процесс регистрации и настройки. Всё, что нужно для начала работы с вашими XML-лимитами.
            </p>

            {/* Шаги - простые и четкие */}
            <div className="space-y-12 mb-16">
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-8 items-start">
                        <div className="flex-shrink-0">
                            <span className="text-4xl font-bold text-gray-300">{step.number}</span>
                        </div>
                        <div className="flex-1 pt-2">
                            <h3 className="text-2xl font-bold text-black mb-3">
                                {step.title}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Кнопка */}
            <Link
                href={route('seo-stats.dashboard')}
                className="inline-block bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors text-lg !text-white"
            >
                <span className="!text-white">Создать аккаунт бесплатно</span>
            </Link>
        </section>
    );
};

export default AiAssistantSection;
