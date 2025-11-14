import React, {useEffect, useRef, useState} from 'react';

const ScreenshotsSection = ({registerRef}) => {
    const sectionRef = useRef(null);
    const [activeTab, setActiveTab] = useState('kanban');

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    // Вкладки с разными видами интерфейса
    const tabs = [
        {id: 'kanban', label: 'Канбан-доска'},
        {id: 'tasks', label: 'Задачи'},
        {id: 'sprints', label: 'Спринты'},
        {id: 'comments', label: 'Комментарии'},
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
            className="max-w-7xl mx-auto px-6 relative pb-24"
        >
            {/* Контейнер для скриншота и описания */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-12 items-center">
                {/* Скриншот */}
                <div className="order-2 lg:order-1 relative">
                    <img
                        src={`images/landing/screen-1.png`}
                        alt={`Скриншот: ${tabs.find(t => t.id === activeTab).label}`}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="order-2 lg:order-1 relative">
                    <img
                        src={`/images/landing/screen-2.png`}
                        alt={`Скриншот: ${tabs.find(t => t.id === activeTab).label}`}
                        className="w-full h-auto object-cover"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 py-12 gap-12 items-center">
                {/* Скриншот */}
                <div className="order-2 lg:order-1 relative">
                    <img
                        src={`images/landing/screen-3.png`}
                        alt={`Скриншот: ${tabs.find(t => t.id === activeTab).label}`}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="order-2 lg:order-1 relative">
                    <img
                        src={`images/landing/screen-4.png`}
                        alt={`Скриншот: ${tabs.find(t => t.id === activeTab).label}`}
                        className="w-full h-auto"
                    />
                </div>
            </div>

        </section>
    )
        ;
};

export default ScreenshotsSection;

