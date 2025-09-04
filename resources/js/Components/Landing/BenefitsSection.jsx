import React, { useRef, useEffect } from 'react';

const BenefitsSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    // Ключевые преимущества сервиса
    const benefits = [
        {
            title: 'Русскоязычный ИИ-ассистент',
            description: 'Первый и единственный ИИ для управления проектами, который полностью понимает русский язык и контекст ваших задач',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            color: 'accent-blue'
        },
        {
            title: 'Минимум обучения',
            description: 'Интуитивно понятный интерфейс и естественное взаимодействие с ИИ позволяют начать работу без длительного обучения',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
            color: 'accent-green'
        },
        {
            title: 'Гибкая настройка',
            description: 'Настраивайте процессы, статусы и уведомления под потребности вашей команды и специфику проектов',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
            color: 'accent-purple'
        },
        {
            title: 'ИИ-оптимизация текста',
            description: 'Встроенный ИИ улучшает качество ваших комментариев и описаний: исправляет ошибки, улучшает стиль, читаемость и добавляет HTML форматирование',
            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
            color: 'accent-purple'
        }
    ];

    // Сравнение с конкурентами
    const competitors = [
        {
            feature: 'Русскоязычный ИИ-ассистент',
            us: true,
            jira: false,
            trello: false,
            asana: false
        },
        {
            feature: 'ИИ-оптимизация текста',
            us: true,
            jira: false,
            trello: false,
            asana: false
        },
        {
            feature: 'Настраиваемые статусы',
            us: true,
            jira: true,
            trello: false,
            asana: false
        },
        {
            feature: 'Telegram уведомления',
            us: true,
            jira: false,
            trello: false,
            asana: false
        },
        {
            feature: 'Упоминания в комментариях',
            us: true,
            jira: true,
            trello: true,
            asana: true
        },
        {
            feature: 'Управление спринтами',
            us: true,
            jira: true,
            trello: false,
            asana: false
        },
        {
            feature: 'Массовые операции через ИИ',
            us: true,
            jira: false,
            trello: false,
            asana: false
        },
        {
            feature: 'Интерфейс на русском языке',
            us: true,
            jira: true,
            trello: true,
            asana: false
        },
    ];

    return (
        <section
            ref={sectionRef}
            id="benefits"
            className="max-w-7xl mx-auto px-6 py-24 relative"
        >
            {/* Декоративный элемент */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-purple/5 rounded-full blur-[120px] -z-10"></div>
            {/* Ключевые преимущества */}
            <div className="text-center mb-16">
                <span className="bg-gradient-to-r from-accent-purple to-accent-indigo px-4 py-1.5 rounded-full text-xs font-semibold inline-block mb-4 text-white">ПРЕИМУЩЕСТВА</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    Почему выбирают 379ТМ
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Уникальные возможности, которые выделяют нас среди конкурентов
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {benefits.map((benefit, index) => (
                    <div
                        key={index}
                        className="group bg-black/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-white hover:bg-black/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-accent-purple/30"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-${benefit.color}/15 text-${benefit.color} grid place-items-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-accent-blue transition-colors">{benefit.title}</h3>
                        <p className="text-gray-300">{benefit.description}</p>
                    </div>
                ))}
            </div>

            {/* Декоративный разделитель */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border-color/30 to-transparent my-24"></div>
        </section>
    );
};

export default BenefitsSection;
