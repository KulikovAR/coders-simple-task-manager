import React, { useRef, useEffect } from 'react';

const BenefitsSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    const benefits = [
        {
            title: 'Русскоязычный ИИ-ассистент',
            description: 'Первый и единственный ИИ для управления проектами, который полностью понимает русский язык и контекст ваших задач',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        },
        {
            title: 'Минимум обучения',
            description: 'Интуитивно понятный интерфейс и естественное взаимодействие с ИИ позволяют начать работу без длительного обучения',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        },
        {
            title: 'Гибкая настройка',
            description: 'Настраивайте процессы, статусы и уведомления под потребности вашей команды и специфику проектов',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        },
        {
            title: 'ИИ-оптимизация текста',
            description: 'Встроенный ИИ улучшает качество ваших комментариев и описаний: исправляет ошибки, улучшает стиль, читаемость и добавляет HTML форматирование',
            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
        }
    ];

    return (
        <section
            ref={sectionRef}
            id="benefits"
            className="max-w-6xl mx-auto px-6 py-32"
        >
            {/* Заголовок */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-16 max-w-4xl leading-tight">
                Почему выбирают 379ТМ
            </h2>
            
            <p className="text-xl text-gray-600 mb-20 max-w-2xl leading-relaxed">
                Уникальные возможности, которые выделяют нас среди конкурентов
            </p>

            {/* Преимущества */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black flex items-center justify-center">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-black mb-3">
                                {benefit.title}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BenefitsSection;
