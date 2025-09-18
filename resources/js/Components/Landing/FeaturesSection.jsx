import React, { useRef, useEffect } from 'react';

const FeaturesSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    // Добавляем стили для анимации
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow-pulse {
                0%, 100% {
                    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.1);
                }
                50% {
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2);
                }
            }

            @keyframes float {
                0%, 100% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-5px);
                }
            }

            @keyframes shimmer {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }

            .feature-highlighted {
                animation: glow-pulse 2s ease-in-out infinite, float 3s ease-in-out infinite;
            }

            .feature-highlighted::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
                background-size: 200% 100%;
                animation: shimmer 3s ease-in-out infinite;
                border-radius: inherit;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Массив функций с иконками и описаниями
    const features = [
        {
            title: 'Управление проектами',
            description: 'Создавайте проекты с детальным описанием, управляйте участниками и ролями, отслеживайте дедлайны',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            color: 'accent-blue',
            isHighlighted: false
        },
        {
            title: 'Канбан-доска',
            description: 'Настраиваемые статусы для каждого проекта, drag & drop интерфейс, фильтрация и поиск задач',
            icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
            color: 'accent-purple',
            isHighlighted: false
        },
        {
            title: 'ИИ-ассистент',
            description: '12+ команд на русском языке для создания задач, назначения исполнителей, обновления статусов и оптимизации текста',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            color: 'accent-cyan',
            isHighlighted: true
        },
        {
            title: 'Спринты и Agile',
            description: 'Планирование и управление спринтами, настраиваемые статусы, отслеживание прогресса',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            color: 'accent-green',
            isHighlighted: false
        },
        {
            title: 'Голосовые сообщения в Telegram',
            description: 'Создание задач через голосовые сообщения в Telegram с помощью ИИ-ассистента для быстрого планирования',
            icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
            color: 'accent-cyan',
            isHighlighted: true
        },
        {
            title: 'Задачи и чек-листы',
            description: 'Создание задач с приоритетами, исполнителями, тегами, дедлайнами и подзадачами',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
            color: 'accent-yellow',
            isHighlighted: false
        },
        {
            title: 'Комментарии и упоминания',
            description: 'Rich-text комментарии, упоминания пользователей (@username), различные типы комментариев',
            icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
            color: 'accent-indigo',
            isHighlighted: false
        },
        {
            title: 'ИИ-оптимизация текста',
            description: 'Встроенный ИИ для улучшения качества текста: исправление ошибок, улучшение стиля, повышение читаемости с HTML форматированием',
            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
            color: 'accent-purple',
            isHighlighted: true
        },
        {
            title: 'Уведомления',
            description: 'Email и Telegram уведомления о назначениях, комментариях, дедлайнах и изменениях статуса',
            icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
            color: 'accent-pink',
            isHighlighted: false
        },
        {
            title: 'Диаграмма Ганта',
            description: 'Визуальное планирование проектов с временными рамками, зависимостями между задачами и отслеживанием прогресса',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            color: 'accent-blue',
            isHighlighted: true
        },
        {
            title: 'Теги и фильтры',
            description: 'Теги для организации задач, быстрые фильтры по исполнителю, статусу, срокам и проекту',
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
            color: 'accent-emerald',
            isHighlighted: false
        },
        {
            title: 'Webhook интеграции',
            description: 'Автоматическая отправка данных в внешние системы при создании задач, обновлениях и событиях проекта',
            icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
            color: 'accent-orange',
            isHighlighted: false
        },
    ];

    // Функция для определения цвета иконки
    const getIconStyles = (color) => {
        const colorMap = {
            'accent-blue': 'text-blue-500 bg-blue-500/10 group-hover:bg-blue-500/20',
            'accent-purple': 'text-purple-500 bg-purple-500/10 group-hover:bg-purple-500/20',
            'accent-green': 'text-green-500 bg-green-500/10 group-hover:bg-green-500/20',
            'accent-cyan': 'text-cyan-500 bg-cyan-500/10 group-hover:bg-cyan-500/20',
            'accent-yellow': 'text-yellow-500 bg-yellow-500/10 group-hover:bg-yellow-500/20',
            'accent-indigo': 'text-indigo-500 bg-indigo-500/10 group-hover:bg-indigo-500/20',
            'accent-red': 'text-red-500 bg-red-500/10 group-hover:bg-red-500/20',
            'accent-emerald': 'text-emerald-500 bg-emerald-500/10 group-hover:bg-emerald-500/20',
            'accent-orange': 'text-orange-500 bg-orange-500/10 group-hover:bg-orange-500/20',
        };
        return colorMap[color] || 'text-blue-500 bg-blue-500/10';
    };

    return (
        <section
            ref={sectionRef}
            id="features"
            className="max-w-7xl mx-auto px-6 py-24 relative"
        >
            {/* Декоративный элемент */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/5 rounded-full blur-[120px] -z-10"></div>

            <div className="text-center mb-16">
                <span className="bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-1.5 rounded-full text-xs font-semibold inline-block mb-4 text-white">ВОЗМОЖНОСТИ</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    Всё необходимое для управления проектами
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Полный набор инструментов для планирования, выполнения и отслеживания задач в команде
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`group relative rounded-2xl border p-6 text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 ${
                            feature.isHighlighted
                                ? 'feature-highlighted border-accent-blue/30 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm hover:border-accent-blue/50 hover:bg-gradient-to-br hover:from-black/70 hover:to-black/50'
                                : 'border-white/5 bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:border-accent-blue/20'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-xl ${getIconStyles(feature.color)} grid place-items-center mb-5 group-hover:scale-110 transition-all duration-300 shadow-sm ${
                            feature.isHighlighted ? 'animate-pulse' : ''
                        }`}>
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                            </svg>
                        </div>
                        <h3 className={`text-lg font-semibold mb-3 group-hover:text-accent-blue transition-colors text-white ${
                            feature.isHighlighted ? 'text-accent-blue' : ''
                        }`}>
                            {feature.title}
                            {feature.isHighlighted && (
                                <span className="ml-2 text-xs bg-accent-blue/20 text-accent-blue px-2 py-1 rounded-full animate-pulse">
                                    NEW
                                </span>
                            )}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Декоративный разделитель */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border-color/30 to-transparent my-24"></div>

        </section>
    );
};

export default FeaturesSection;
