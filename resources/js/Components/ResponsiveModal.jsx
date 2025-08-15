import { useEffect } from 'react';

/**
 * Адаптивная модалка с улучшенным UX для мобильных устройств
 * @param {boolean} isOpen - открыта ли модалка
 * @param {function} onClose - функция закрытия
 * @param {string} title - заголовок модалки
 * @param {React.ReactNode} children - содержимое
 * @param {string} size - размер (sm, md, lg, xl, full)
 * @param {boolean} fullScreenOnMobile - полноэкранная на мобильных
 * @param {string} className - дополнительные CSS классы
 */
export default function ResponsiveModal({
    isOpen,
    onClose,
    title,
    children,
    size = 'lg',
    fullScreenOnMobile = true,
    className = ''
}) {
    // Блокируем скролл body при открытой модалке
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Добавляем padding-right для компенсации скроллбара
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    // Закрытие по Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const getSizeClasses = () => {
        const sizeMap = {
            sm: 'max-w-md',
            md: 'max-w-2xl',
            lg: 'max-w-4xl',
            xl: 'max-w-6xl',
            full: 'max-w-7xl'
        };
        return sizeMap[size] || sizeMap.lg;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Modal container */}
            <div className="relative z-10 flex min-h-full">
                {/* Mobile: slide up from bottom */}
                <div className={`
                    w-full transition-all duration-300 ease-out
                    ${fullScreenOnMobile 
                        ? 'lg:flex lg:items-center lg:justify-center lg:p-4' 
                        : 'flex items-center justify-center p-4'
                    }
                `}>
                    <div 
                        className={`
                            w-full bg-card-bg border border-border-color shadow-2xl
                            transform transition-all duration-300 ease-out
                            ${fullScreenOnMobile 
                                ? `
                                    h-full lg:h-auto lg:max-h-[90vh] lg:rounded-2xl
                                    ${getSizeClasses()}
                                `
                                : `
                                    max-h-[90vh] rounded-2xl ${getSizeClasses()}
                                `
                            }
                            ${className}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border-color bg-gradient-to-r from-accent-blue to-accent-purple">
                                <h3 className="text-lg lg:text-xl font-semibold text-white truncate pr-4">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="flex-shrink-0 text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        
                        {/* Content */}
                        <div className={`
                            overflow-y-auto scrollbar-thin
                            ${fullScreenOnMobile 
                                ? 'h-[calc(100%-4rem)] lg:max-h-[calc(90vh-8rem)]'
                                : 'max-h-[calc(90vh-8rem)]'
                            }
                        `}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
