import { forwardRef } from 'react';

/**
 * Компонент поиска с индикатором загрузки
 * @param {string} value - значение поиска
 * @param {function} onChange - обработчик изменения
 * @param {string} placeholder - placeholder текст
 * @param {boolean} isLoading - показать индикатор загрузки
 * @param {string} className - дополнительные CSS классы
 * @param {object} props - остальные props
 */
const SearchInput = forwardRef(function SearchInput({
    value = '',
    onChange,
    placeholder = 'Поиск...',
    isLoading = false,
    className = '',
    ...props
}, ref) {
    return (
        <div className="relative">
            <input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`form-input pr-10 ${className}`}
                {...props}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isLoading ? (
                    <svg className="animate-spin h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                )}
            </div>
        </div>
    );
});

export default SearchInput;
