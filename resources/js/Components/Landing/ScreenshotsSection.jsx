import React, { useRef, useEffect, useState } from 'react';

const ScreenshotsSection = ({ registerRef }) => {
    const sectionRef = useRef(null);
    const [activeTab, setActiveTab] = useState('kanban');

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    // Вкладки с разными видами интерфейса
    const tabs = [
        { id: 'kanban', label: 'Канбан-доска' },
        { id: 'tasks', label: 'Задачи' },
        { id: 'sprints', label: 'Спринты' },
        { id: 'comments', label: 'Комментарии' },
    ];

    // Заглушки для скриншотов (в реальном проекте здесь будут пути к изображениям)
    const screenshots = {
        kanban: {
            title: 'Канбан-доска с настраиваемыми статусами',
            description: 'Визуализируйте рабочий процесс с помощью гибкой канбан-доски. Создавайте собственные статусы для каждого проекта или спринта, перетаскивайте задачи между колонками и отслеживайте прогресс в реальном времени.',
            imagePlaceholder: 'kanban-board-screenshot.png',
            features: [
                'Настраиваемые статусы для каждого проекта',
                'Drag & drop интерфейс для перемещения задач',
                'Фильтрация по исполнителям, тегам и приоритетам',
                'Быстрое создание и редактирование задач',
                'Визуальные индикаторы приоритета и дедлайнов'
            ]
        },
        tasks: {
            title: 'Детальные карточки задач',
            description: 'Каждая задача содержит всю необходимую информацию: описание, исполнителей, теги, приоритет, дедлайны и чек-листы. Прикрепляйте файлы, оставляйте комментарии и отслеживайте историю изменений.',
            imagePlaceholder: 'task-details-screenshot.png',
            features: [
                'Подробное описание с форматированием',
                'Чек-листы для разбиения на подзадачи',
                'Назначение исполнителей и ответственных',
                'Теги и метки для организации',
                'Отслеживание времени выполнения'
            ]
        },
        sprints: {
            title: 'Управление спринтами',
            description: 'Планируйте и управляйте спринтами в стиле Agile. Определяйте продолжительность, добавляйте задачи из бэклога, отслеживайте прогресс и анализируйте результаты после завершения.',
            imagePlaceholder: 'sprints-management-screenshot.png',
            features: [
                'Планирование спринтов с датами начала и окончания',
                'Перенос задач из бэклога в спринт',
                'Отслеживание прогресса и скорости команды',
                'Статистика по завершенным спринтам',
                'Ретроспектива и анализ эффективности'
            ]
        },
        comments: {
            title: 'Rich-text комментарии с упоминаниями',
            description: 'Обсуждайте задачи с помощью полноценного редактора комментариев. Форматируйте текст, добавляйте списки и таблицы, упоминайте коллег с помощью @username и получайте мгновенные уведомления.',
            imagePlaceholder: 'comments-mentions-screenshot.png',
            features: [
                'Форматирование текста (жирный, курсив, списки)',
                'Упоминания пользователей с автодополнением',
                'Различные типы комментариев (общие, баги, фичи)',
                'Вложенные обсуждения и ответы',
                'Уведомления об упоминаниях в Email и Telegram'
            ]
        }
    };

    const currentScreenshot = screenshots[activeTab];

    return (
        <section
            ref={sectionRef}
            id="screenshots"
            className="max-w-7xl mx-auto px-6 py-24 relative"
        >
            {/* Декоративный фон */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-purple/5 rounded-full blur-[120px] -z-10"></div>

            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    Современный и интуитивно понятный дизайн
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Современный интерфейс с продуманной эргономикой для максимальной продуктивности и комфортной работы
                </p>
            </div>

            {/* Табы для переключения между скриншотами */}
            <div className="flex justify-center mb-12 overflow-x-auto pb-2">
                <div className="inline-flex bg-black/40 backdrop-blur-sm rounded-full p-1.5 border border-white/5 shadow-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-accent-purple to-accent-indigo text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Контейнер для скриншота и описания */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Скриншот */}
                <div className="order-2 lg:order-1 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent-purple/20 to-accent-indigo/20 rounded-2xl blur-sm"></div>
                    <div className="relative rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                        {/* Замените {activeTab}-screenshot.png на нужный скриншот. Путь: public/images/landing/{id}-screenshot.png */}
                        <img
                            src={`/images/landing/${activeTab}-screenshot.png`}
                            alt={`Скриншот: ${tabs.find(t => t.id === activeTab).label}`}
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    </div>
                </div>

                {/* Описание */}
                <div className="order-1 lg:order-2">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">{currentScreenshot.title}</h3>
                    <p className="text-gray-300 mb-8 text-lg leading-relaxed">{currentScreenshot.description}</p>
                    <div className="space-y-4">
                        {currentScreenshot.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-accent-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent-purple to-accent-indigo grid place-items-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-white">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Декоративный разделитель */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border-color/30 to-transparent my-24"></div>
        </section>
    );
};

export default ScreenshotsSection;
