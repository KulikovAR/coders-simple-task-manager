import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const AiAssistantSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    const aiFeatures = [
        {
            title: 'Естественный язык',
            description: 'Общение на русском языке без необходимости изучать специальные команды',
            icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129'
        },
        {
            title: 'Контекстная память',
            description: 'Ассистент помнит контекст беседы и понимает ссылки на предыдущие команды',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            title: 'Массовые операции',
            description: 'Выполнение операций над множеством объектов одной командой',
            icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4'
        },
        {
            title: 'Валидация команд',
            description: 'Проверка корректности команд перед выполнением и подсказки при ошибках',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
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
                ИИ для управления проектами
            </h2>

            <p className="text-xl text-gray-600 mb-20 max-w-2xl leading-relaxed">
                Управляйте проектами с помощью естественных команд на русском языке. ИИ-ассистент создаст задачи, назначит исполнителей, изменит статусы и предоставит отчёты по вашему запросу.
            </p>

            {/* Возможности */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12">
                {aiFeatures.map((feature, index) => (
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

export default AiAssistantSection;
