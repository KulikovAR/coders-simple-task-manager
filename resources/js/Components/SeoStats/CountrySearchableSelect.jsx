import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function CountrySearchableSelect({ 
    value, 
    onChange, 
    placeholder = "Выберите страну...", 
    required = false,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Загрузка популярных стран при первом открытии
    useEffect(() => {
        if (isOpen && !initialLoad) {
            loadPopularCountries();
            setInitialLoad(true);
        }
    }, [isOpen, initialLoad]);

    // Поиск стран с задержкой
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchTerm && searchTerm.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                searchCountries(searchTerm);
            }, 300);
        } else if (searchTerm === '') {
            loadPopularCountries();
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    // Закрытие dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadPopularCountries = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/dadata/countries/popular');
            if (response.data.success) {
                setOptions(response.data.data);
            }
        } catch (error) {
            console.error('Error loading popular countries:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchCountries = async (query) => {
        try {
            setLoading(true);
            const response = await axios.post('/api/dadata/countries/search', {
                query: query
            });
            if (response.data.success) {
                setOptions(response.data.data);
            }
        } catch (error) {
            console.error('Error searching countries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (option) => {
        // Сохраняем объект с кодом и названием
        onChange({
            code: option.value,
            name: option.label
        });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    // Простое определение выбранной страны
    const selectedCountry = typeof value === 'object' && value !== null ? value : null;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 text-left flex items-center justify-between ${
                    required && !value ? 'border-accent-red' : ''
                }`}
            >
                <span className={selectedCountry?.name ? 'text-text-primary' : 'text-text-muted'}>
                    {selectedCountry?.name || placeholder}
                </span>
                <svg 
                    className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-card-bg border border-border-color rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-border-color">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Поиск стран..."
                                className="w-full px-2 py-1 text-sm bg-secondary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue/20"
                            />
                            {loading && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {loading && options.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-text-muted text-center">
                                Загрузка...
                            </div>
                        ) : options.length > 0 ? (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary-bg transition-colors ${
                                        selectedCountry?.code === option.value
                                            ? 'bg-accent-blue/10 text-accent-blue' 
                                            : 'text-text-primary'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option.label}</span>
                                        {option.alfa2 && (
                                            <span className="text-xs text-text-muted bg-secondary-bg px-2 py-1 rounded">
                                                {option.alfa2.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-text-muted text-center">
                                {searchTerm.length < 2 ? 'Введите минимум 2 символа для поиска' : 'Ничего не найдено'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
