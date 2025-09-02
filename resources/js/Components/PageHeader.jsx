import { Link } from '@inertiajs/react';

/**
 * Компонент заголовка страницы с кнопками действий
 * @param {string} title - заголовок страницы
 * @param {string} description - описание страницы
 * @param {Array} actions - массив объектов кнопок действий
 * [
 *   {
 *     type: 'button' | 'link',
 *     variant: 'primary' | 'secondary' | 'gradient',
 *     text: 'Текст кнопки',
 *     icon: 'SVG path for icon',
 *     href: 'route' (для link),
 *     onClick: function (для button),
 *     mobileOrder: number (порядок на мобильных, по умолчанию как в массиве)
 *   }
 * ]
 * @param {string} className - дополнительные CSS классы
 * @param {boolean} stackOnMobile - складывать кнопки вертикально на мобильных
 */
export default function PageHeader({
    title,
    description,
    actions = [],
    className = '',
    stackOnMobile = true
}) {
    const getButtonClasses = (variant, isMobile = false) => {
        const baseClasses = isMobile
            ? 'inline-flex items-center justify-center h-11 w-full sm:w-auto'
            : 'inline-flex items-center justify-center h-11';

        switch (variant) {
            case 'primary':
                return `btn btn-primary ${baseClasses}`;
            case 'secondary':
                return `btn btn-secondary ${baseClasses}`;
            case 'gradient':
                return `bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-white ${baseClasses}`;
            default:
                return `btn btn-secondary ${baseClasses}`;
        }
    };

    // Сортируем действия по приоритету для мобильных
    const sortedActions = [...actions].sort((a, b) => {
        const orderA = a.mobileOrder ?? actions.indexOf(a);
        const orderB = b.mobileOrder ?? actions.indexOf(b);
        return orderA - orderB;
    });

    return (
        <div className={`flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0 ${className}`}>
            <div className="min-w-0 flex-1">
                <h1 className="text-heading-2 lg:text-heading-1 text-text-primary">{title}</h1>
                {description && (
                    <p className="text-text-secondary mt-1 text-body lg:text-body-large">{description}</p>
                )}
            </div>

            {sortedActions.length > 0 && (
                <div className={`
                    flex-shrink-0 w-full lg:w-auto
                    ${stackOnMobile
                        ? 'flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 lg:space-x-3'
                        : 'flex flex-row flex-wrap gap-2 sm:gap-3'
                    }
                `}>
                    {sortedActions.map((action, index) => {
                        const buttonClasses = getButtonClasses(action.variant, stackOnMobile);

                        if (action.type === 'link') {
                            return (
                                <Link
                                    key={action.key || index}
                                    href={action.href}
                                    className={buttonClasses}
                                >
                                    {action.icon && (
                                        typeof action.icon === 'string' && action.icon.startsWith('M') ? (
                                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                                            </svg>
                                        ) : (
                                            <span className="mr-2 text-sm sm:text-base">{action.icon}</span>
                                        )
                                    )}
                                    <span className="text-sm sm:text-base">{action.text}</span>
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={action.key || index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (action.onClick) {
                                        action.onClick(e);
                                    }
                                }}
                                className={buttonClasses}
                                disabled={action.disabled}
                                style={action.variant === 'gradient' ? { color: 'white' } : {}}
                                type="button"
                            >
                                {action.icon && (
                                    typeof action.icon === 'string' && action.icon.startsWith('M') ? (
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                                        </svg>
                                    ) : (
                                        <span className="mr-2 text-sm sm:text-base">{action.icon}</span>
                                    )
                                )}
                                <span className="text-sm sm:text-base">{action.text}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
