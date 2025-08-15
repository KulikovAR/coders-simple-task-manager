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
 *     onClick: function (для button)
 *   }
 * ]
 * @param {string} className - дополнительные CSS классы
 */
export default function PageHeader({ title, description, actions = [], className = '' }) {
    const getButtonClasses = (variant) => {
        switch (variant) {
            case 'primary':
                return 'btn btn-primary';
            case 'secondary':
                return 'btn btn-secondary';
            case 'gradient':
                return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-white';
            default:
                return 'btn btn-secondary';
        }
    };

    return (
        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center ${className}`}>
            <div>
                <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
                {description && (
                    <p className="text-text-secondary mt-1">{description}</p>
                )}
            </div>
            
            {actions.length > 0 && (
                <div className="flex flex-col gap-3 mt-4 sm:mt-0 sm:flex-row sm:space-x-3 sm:items-center">
                    {actions.map((action, index) => {
                        const buttonClasses = `${getButtonClasses(action.variant)} inline-flex items-center justify-center h-11`;
                        
                        if (action.type === 'link') {
                            const { Link } = require('@inertiajs/react');
                            return (
                                <Link
                                    key={index}
                                    href={action.href}
                                    className={buttonClasses}
                                >
                                    {action.icon && (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                                        </svg>
                                    )}
                                    {action.text}
                                </Link>
                            );
                        }
                        
                        return (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={buttonClasses}
                                style={action.variant === 'gradient' ? { color: 'white' } : {}}
                            >
                                {action.icon && (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                                    </svg>
                                )}
                                {action.text}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
