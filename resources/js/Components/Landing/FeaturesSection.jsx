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
            title: 'Управление проектами',
            description: 'Создавайте проекты с детальным описанием, управляйте участниками и ролями, отслеживайте дедлайны',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        },
        {
            title: 'Канбан-доска',
            description: 'Настраиваемые статусы для каждого проекта, drag & drop интерфейс, фильтрация и поиск задач',
            icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
        },
        {
            title: 'ИИ-ассистент',
            description: '12+ команд на русском языке для создания задач, назначения исполнителей, обновления статусов и оптимизации текста',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
        },
        {
            title: 'Спринты и Agile',
            description: 'Планирование и управление спринтами, настраиваемые статусы, отслеживание прогресса',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        },
        {
            title: 'Голосовые сообщения в Telegram',
            description: 'Создание задач через голосовые сообщения в Telegram с помощью ИИ-ассистента для быстрого планирования',
            icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
        },
        {
            title: 'Задачи и чек-листы',
            description: 'Создание задач с приоритетами, исполнителями, тегами, дедлайнами и подзадачами',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        },
        {
            title: 'Комментарии и упоминания',
            description: 'Rich-text комментарии, упоминания пользователей (@username), различные типы комментариев',
            icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
        },
        {
            title: 'ИИ-оптимизация текста',
            description: 'Встроенный ИИ для улучшения качества текста: исправление ошибок, улучшение стиля, повышение читаемости с HTML форматированием',
            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
        },
        {
            title: 'Уведомления',
            description: 'Email и Telegram уведомления о назначениях, комментариях, дедлайнах и изменениях статуса',
            icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        },
        {
            title: 'Диаграмма Ганта',
            description: 'Визуальное планирование проектов с временными рамками, зависимостями между задачами и отслеживанием прогресса',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        },
        {
            title: 'Теги и фильтры',
            description: 'Теги для организации задач, быстрые фильтры по исполнителю, статусу, срокам и проекту',
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
        },
        {
            title: 'Webhook интеграции',
            description: 'Автоматическая отправка данных в внешние системы при создании задач, обновлениях и событиях проекта',
            icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
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
                Всё необходимое для управления проектами
            </h2>
            
            <p className="text-xl text-gray-600 mb-20 max-w-2xl leading-relaxed">
                Полный набор инструментов для планирования, выполнения и отслеживания задач в команде
            </p>

            {/* Список функций */}
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
