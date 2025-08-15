import { Link } from '@inertiajs/react';

/**
 * Компонент для отображения пустых состояний
 * @param {string} title - заголовок
 * @param {string} description - описание
 * @param {string} icon - SVG иконка (путь для path элемента)
 * @param {object} action - объект действия {href, text, icon}
 * @param {function} onClearFilters - функция очистки фильтров
 * @param {boolean} hasFilters - есть ли активные фильтры
 * @param {string} className - дополнительные CSS классы
 */
export default function EmptyState({ 
    title, 
    description, 
    icon = "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    action,
    onClearFilters,
    hasFilters = false,
    className = ''
}) {
    const defaultTitle = hasFilters ? 'Ничего не найдено' : 'Пока пусто';
    const defaultDescription = hasFilters 
        ? 'Попробуйте изменить параметры поиска или очистить фильтры' 
        : 'Создайте первый элемент для начала работы';

    return (
        <div className={`card text-center ${className}`}>
            <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
            </svg>
            <h3 className="text-lg font-medium text-text-secondary mb-2">
                {title || defaultTitle}
            </h3>
            <p className="text-text-muted mb-4">
                {description || defaultDescription}
            </p>
            
            {hasFilters && onClearFilters && (
                <button
                    onClick={onClearFilters}
                    className="btn btn-secondary mb-4 mr-2"
                >
                    Очистить фильтры
                </button>
            )}
            
            {action && !hasFilters && (
                <Link
                    href={action.href}
                    className="btn btn-primary inline-flex items-center"
                >
                    {action.icon && (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                        </svg>
                    )}
                    {action.text}
                </Link>
            )}
        </div>
    );
}
