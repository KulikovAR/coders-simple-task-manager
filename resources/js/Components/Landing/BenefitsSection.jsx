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
            title: 'Темная тема',
            description: 'Профессиональный дизайн с темной темой снижает нагрузку на глаза при длительной работе',
            icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
            color: 'accent-indigo'
        },
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
            className="max-w-7xl mx-auto px-6 py-8"
        >
            {/* Ключевые преимущества */}
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
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
                        className="bg-[#131313] border border-border-color rounded-2xl p-8 text-white hover:bg-[#232323] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-${benefit.color}/15 text-${benefit.color} grid place-items-center mb-6`}>
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-white">{benefit.title}</h3>
                        <p className="text-gray-300">{benefit.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BenefitsSection;
