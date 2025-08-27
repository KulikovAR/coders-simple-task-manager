import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const AiAssistantSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    // Примеры команд для ИИ-ассистента
    const aiCommands = [
        { command: 'Создай проект «Запуск нового сайта»', response: 'Проект успешно создан.' },
        { command: 'Добавь спринт «Дизайн главной» на следующую неделю', response: 'Спринт создан и привязан к проекту.' },
        { command: 'Создай 3 задачи для «Верстки» и назначь на @Алексея', response: 'Создано 3 задачи и назначено на Алексея.' },
        { command: 'Перенеси все задачи из «Бэклог» в «В работе»', response: 'Перемещено 5 задач из статуса «Бэклог» в «В работе».' },
        { command: 'Покажи все просроченные задачи', response: 'Найдено 2 просроченные задачи. Вывожу список...' },
    ];

    // Возможности ИИ-ассистента
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
            className="max-w-7xl mx-auto px-6 py-24 relative"
        >
            {/* Декоративный элемент */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/5 rounded-full blur-[120px] -z-10"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Левая колонка - Демонстрация диалога */}
                <div className="order-2 lg:order-1">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-lg backdrop-blur-sm hover:shadow-xl hover:bg-black/60 hover:border-accent-purple/30 transition-all duration-300 hover:-translate-y-1.5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue grid place-items-center text-xs font-medium">
                                ИИ
                            </div>
                            <div className="text-sm text-text-secondary">
                                Чем я могу помочь?
                            </div>
                        </div>

                        <div className="space-y-6">
                            {aiCommands.map((item, index) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex justify-end">
                                        <div className="max-w-[85%] rounded-xl bg-accent-blue text-white px-4 py-3 text-sm">
                                            {item.command}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue grid place-items-center text-xs font-medium mt-1">
                                            ИИ
                                        </div>
                                        <div className="max-w-[85%] rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm shadow-sm">
                                            {item.response}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 flex">
                            <div className="bg-black/50 rounded-xl border border-white/5 flex-1 px-4 py-3 text-gray-400 text-sm shadow-sm">
                                Введите команду...
                            </div>
                            <button className="ml-2 w-10 h-10 rounded-xl bg-accent-blue text-white grid place-items-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Правая колонка - Описание возможностей */}
                <div className="order-1 lg:order-2">
                    <span className="bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-1.5 rounded-full text-xs font-semibold inline-block mb-4 text-white">ИИ-АССИСТЕНТ</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                       ИИ для управления проектами
                    </h2>
                    <p className="text-lg text-gray-300 mb-8">
                        Управляйте проектами с помощью естественных команд на русском языке. ИИ-ассистент создаст задачи, назначит исполнителей, изменит статусы и предоставит отчёты по вашему запросу.
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
                        href={route('ai-features')}
                        className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors"
                    >
                        Узнать больше о возможностях ИИ
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
