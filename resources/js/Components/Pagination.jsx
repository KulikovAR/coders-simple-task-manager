import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

/**
 * Компонент пагинации
 * @param {object} data - объект с данными пагинации из Laravel
 * @param {Array} data.links - массив ссылок пагинации
 * @param {string} className - дополнительные CSS классы
 */
export default function Pagination({ data, className = '' }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Получаем текущие параметры URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentParams = {};
    
    // Сохраняем все существующие параметры кроме page
    for (const [key, value] of urlParams.entries()) {
        if (key !== 'page') {
            currentParams[key] = value;
        }
    }
    if (!data?.links || data.links.length <= 3) {
        return null;
    }

    const formatLabel = (label) => {
        return label
            .replace('Previous', 'Предыдущая')
            .replace('Next', 'Следующая');
    };

    // Функция для определения, нужно ли показывать номер страницы
    const shouldShowPage = (index, total) => {
        // Всегда показываем первую и последнюю страницу
        if (index === 0 || index === total - 1) return true;
        
        // Находим активную страницу
        const activePage = data.links.findIndex(link => link.active);
        
        // На мобильных показываем меньше страниц
        const range = isMobile ? 1 : 2;

        // Показываем страницы рядом с активной
        return Math.abs(index - activePage) <= range;
    };

    // Функция для получения URL следующей/предыдущей группы страниц
    const getGroupUrl = (index, direction) => {
        const activePage = data.links.findIndex(link => link.active);
        const range = isMobile ? 1 : 2;
        const step = range * 2 + 1; // Размер группы
        
        let targetIndex;
        if (direction === 'next') {
            targetIndex = Math.min(index + 1, data.links.length - 2);
        } else {
            targetIndex = Math.max(index - 1, 1);
        }

        // Находим ближайшую доступную страницу в нужном направлении
        while (targetIndex > 0 && targetIndex < data.links.length - 1) {
            if (data.links[targetIndex].url) {
                const url = new URL(data.links[targetIndex].url);
                Object.entries(currentParams).forEach(([key, value]) => {
                    url.searchParams.set(key, value);
                });
                return url.toString();
            }
            targetIndex += direction === 'next' ? 1 : -1;
        }
        
        return null;
    };

    return (
        <div className={`flex justify-center ${className}`}>
            <nav className="flex flex-wrap justify-center gap-2 px-4 sm:px-0">
                {data.links.map((link, index, array) => {
                    const label = formatLabel(link.label);
                    const isNavigationLink = index === 0 || index === array.length - 1;
                    
                    // Пропускаем страницы, которые не нужно показывать на мобильных
                    if (!isNavigationLink && !shouldShowPage(index, array.length)) {
                        // Показываем кликабельное многоточие между группами страниц
                        if (shouldShowPage(index - 1, array.length) && !link.active) {
                            const direction = index > array.findIndex(l => l.active) ? 'next' : 'prev';
                            const groupUrl = getGroupUrl(index, direction);
                            
                            if (groupUrl) {
                                return (
                                    <Link
                                        key={index}
                                        href={groupUrl}
                                        preserveScroll={true}
                                        preserveState={true}
                                        className="px-2 py-1.5 sm:py-2 rounded-lg text-sm font-medium bg-card-bg text-text-primary hover:bg-secondary-bg transition-colors min-w-[2.5rem] text-center"
                                    >
                                        •••
                                    </Link>
                                );
                            }
                        }
                        return null;
                    }

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm font-medium bg-card-bg text-text-muted cursor-not-allowed min-w-[2.5rem] text-center"
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    }

                    // Добавляем текущие параметры к URL пагинации
                    const url = new URL(link.url);
                    Object.entries(currentParams).forEach(([key, value]) => {
                        url.searchParams.set(key, value);
                    });

                    return (
                        <Link
                            key={index}
                            href={url.toString()}
                            preserveScroll={true}
                            preserveState={true}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors min-w-[2.5rem] text-center ${
                                link.active
                                    ? 'bg-secondary-bg text-text-primary'
                                    : 'bg-card-bg text-text-primary hover:bg-secondary-bg'
                            } ${isNavigationLink ? 'hidden sm:block' : ''}`}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </nav>
        </div>
    );
}
