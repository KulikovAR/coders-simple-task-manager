import { Link } from '@inertiajs/react';

/**
 * Компонент пагинации
 * @param {object} data - объект с данными пагинации из Laravel
 * @param {Array} data.links - массив ссылок пагинации
 * @param {string} className - дополнительные CSS классы
 */
export default function Pagination({ data, className = '' }) {
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

    return (
        <div className={`flex justify-center ${className}`}>
            <nav className="flex space-x-2">
                {data.links.map((link, index) => {
                    const label = formatLabel(link.label);
                    
                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-card-bg text-text-muted cursor-not-allowed"
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
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                link.active
                                    ? 'bg-secondary-bg text-text-primary'
                                    : 'bg-card-bg text-text-primary hover:bg-secondary-bg'
                            }`}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </nav>
        </div>
    );
}
