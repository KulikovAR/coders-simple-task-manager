import React from 'react';

export default function UserAvatar({
    user,
    size = 'md',
    showName = false,
    className = '',
    nameClassName = ''
}) {
    // Размеры аватарки
    const sizeClasses = {
        xs: 'w-4 h-4 text-xs',
        sm: 'w-5 h-5 text-xs',
        md: 'w-6 h-6 text-sm',
        lg: 'w-8 h-8 text-base',
        xl: 'w-10 h-10 text-lg'
    };

    // Стили для разных контекстов
    const contextClasses = {
        default: 'bg-accent-blue/20 text-accent-blue',
        modal: 'bg-white/90 dark:bg-transparent text-slate-800 dark:text-white border border-slate-300 dark:border-white shadow-sm',
        card: 'bg-accent-blue/20 text-accent-blue'
    };

    // Определяем контекст на основе className
    const getContextClass = () => {
        if (className.includes('border-slate') || className.includes('dark:border-white')) {
            return contextClasses.modal;
        }
        if (className.includes('card') || className.includes('bg-accent-blue')) {
            return contextClasses.card;
        }
        return contextClasses.default;
    };

    const avatarClasses = `${sizeClasses[size]} ${getContextClass()} rounded-full flex items-center justify-center overflow-hidden ${className}`;

    return (
        <div className="flex items-center gap-2">
            <div className={avatarClasses}>
                {user?.avatar ? (
                    <img 
                        src={`/storage/${user.avatar}`} 
                        alt={user.name || 'User'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                )}
            </div>
            {showName && user?.name && (
                <span className={`truncate ${nameClassName}`}>
                    {user.name}
                </span>
            )}
        </div>
    );
}
