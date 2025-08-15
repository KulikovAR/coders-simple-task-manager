/**
 * Компонент информационной карточки с иконкой
 * @param {string} title - заголовок
 * @param {string} description - описание
 * @param {string} icon - SVG путь для иконки
 * @param {string} variant - вариант стиля (info, warning, success, error)
 * @param {React.ReactNode} children - дополнительный контент
 * @param {string} className - дополнительные CSS классы
 */
export default function InfoCard({ 
    title, 
    description, 
    icon, 
    variant = 'info', 
    children, 
    className = '' 
}) {
    const getVariantClasses = () => {
        switch (variant) {
            case 'warning':
                return 'bg-gradient-to-r from-accent-yellow/10 to-accent-orange/10 border-accent-yellow/20';
            case 'success':
                return 'bg-gradient-to-r from-accent-green/10 to-accent-emerald/10 border-accent-green/20';
            case 'error':
                return 'bg-gradient-to-r from-accent-red/10 to-accent-rose/10 border-accent-red/20';
            default:
                return 'bg-gradient-to-r from-accent-blue/10 to-accent-cyan/10 border-accent-blue/20';
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'warning':
                return 'text-accent-yellow';
            case 'success':
                return 'text-accent-green';
            case 'error':
                return 'text-accent-red';
            default:
                return 'text-accent-blue';
        }
    };

    const getIconEmoji = () => {
        switch (variant) {
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            default:
                return '💡';
        }
    };

    return (
        <div className={`card ${getVariantClasses()} ${className}`}>
            <div className="flex items-start space-x-3">
                <div className={`${getIconColor()} text-xl flex-shrink-0`}>
                    {icon ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                        </svg>
                    ) : (
                        getIconEmoji()
                    )}
                </div>
                <div className="flex-1">
                    {title && (
                        <h3 className="font-medium text-text-primary mb-1">{title}</h3>
                    )}
                    {description && (
                        <p className="text-sm text-text-secondary">{description}</p>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
