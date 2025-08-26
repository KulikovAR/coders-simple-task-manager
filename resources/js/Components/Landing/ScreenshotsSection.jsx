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
            className="max-w-7xl mx-auto px-6 py-20"
        >
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                    Современный и интуитивно понятный дизайн
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Минималистичный интерфейс с тёмной темой и продуманной эргономикой для комфортной работы
                </p>
            </div>

            {/* Табы для переключения между скриншотами */}
            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
                <div className="inline-flex bg-[#131313] backdrop-blur-sm rounded-full p-1 border border-border-color shadow-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-accent-blue text-white shadow-glow'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Контейнер для скриншота и описания */}
            <div className="flex flex-col items-center gap-12">
                {/* Скриншот */}
                <div className="flex items-center justify-center w-full">
                    {/* Замените {activeTab}-screenshot.png на нужный скриншот. Путь: public/images/landing/{id}-screenshot.png */}
                    <img src={`/images/landing/${activeTab}-screenshot.png`} alt={`Скриншот: ${tabs.find(t => t.id === activeTab).label}`} className="w-full max-w-4xl h-auto object-cover shadow-xl" />
                </div>
                {/* Описание */}
                <div className="w-full max-w-2xl text-center">
                    <h3 className="text-2xl font-semibold mb-4">{currentScreenshot.title}</h3>
                    <p className="text-text-secondary mb-8">{currentScreenshot.description}</p>
                    <div className="space-y-3">
                        {currentScreenshot.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 bg-[#131313] rounded-lg p-3 hover:bg-[#232323] transition-all duration-300">
                                <div className="w-5 h-5 rounded-full bg-accent-blue/20 text-accent-blue grid place-items-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-white">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </section>
    );
};

export default ScreenshotsSection;
