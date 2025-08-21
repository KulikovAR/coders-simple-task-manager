import SearchInput from './SearchInput';
import TagsInput from './TagsInput';

/**
 * Компонент панели фильтров
 * @param {boolean} isVisible - видимость панели
 * @param {function} onClearFilters - обработчик очистки фильтров
 * @param {object} searchConfig - конфигурация поиска {value, onChange, placeholder, isLoading}
 * @param {Array} filters - массив фильтров
 * [
 *   {
 *     type: 'select' | 'checkbox',
 *     label: 'Статус',
 *     value: currentValue,
 *     onChange: handleChange,
 *     options: [{value: '', label: 'Все'}, ...] // только для select
 *     checked: boolean // только для checkbox
 *   }
 * ]
 * @param {React.ReactNode} children - дополнительный контент фильтров
 * @param {string} className - дополнительные CSS классы
 */
export default function FilterPanel({
    isVisible,
    onClearFilters,
    searchConfig,
    filters = [],
    children,
    className = ''
}) {
    // Отладочная информация
    console.log('FilterPanel render:', { isVisible, filtersCount: filters.length });
    
    if (!isVisible) {
        console.log('FilterPanel: not visible, returning null');
        return null;
    }

    return (
        <div className={`card ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <h3 className="card-title">Фильтры поиска</h3>
                <button
                    onClick={onClearFilters}
                    className="text-sm text-accent-red hover:text-accent-red/80 transition-colors text-center sm:text-left"
                >
                    Очистить все
                </button>
            </div>
            
            <div className="space-y-4">
                {/* Поиск */}
                {searchConfig && (
                    <div className="min-w-0">
                        <label className="form-label">
                            {searchConfig.label || 'Поиск'}
                        </label>
                        <SearchInput
                            value={searchConfig.value}
                            onChange={searchConfig.onChange}
                            placeholder={searchConfig.placeholder}
                            isLoading={searchConfig.isLoading}
                        />
                    </div>
                )}

                {/* Сетка фильтров */}
                {filters.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {filters.map((filter, index) => (
                            <div key={index} className="min-w-0">
                                <label className="form-label">
                                    {filter.label}
                                </label>
                                {filter.type === 'select' ? (
                                    <select
                                        value={filter.value}
                                        onChange={filter.onChange}
                                        className="form-select w-full"
                                        disabled={filter.disabled}
                                    >
                                        {filter.options?.map((option, optionIndex) => (
                                            <option key={optionIndex} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : filter.type === 'checkbox' ? (
                                    <label className="flex items-center gap-2 text-body-small text-text-primary whitespace-nowrap select-none cursor-pointer mt-2">
                                        <input
                                            type="checkbox"
                                            checked={filter.checked}
                                            onChange={filter.onChange}
                                            className="form-checkbox h-5 w-5 text-accent-blue border-border-color focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-card-bg rounded-lg transition-all duration-200 flex-shrink-0"
                                        />
                                        <span className="ml-1">{filter.checkboxLabel}</span>
                                    </label>
                                ) : filter.type === 'tags' ? (
                                    <TagsInput
                                        value={filter.value}
                                        onChange={filter.onChange}
                                        placeholder={filter.placeholder}
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}

                {/* Дополнительный контент */}
                {children}
            </div>
        </div>
    );
}
