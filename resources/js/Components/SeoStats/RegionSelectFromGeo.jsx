import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function RegionSelectFromGeo({ 
    value, 
    onChange, 
    placeholder = "Выберите регион...", 
    required = false,
    className = "",
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && options.length === 0) {
            loadRegions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (value && options.length === 0) {
            loadRegions();
        }
    }, [value]);

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

    const loadRegions = async (query = '') => {
        try {
            setLoading(true);
            const response = await axios.get('/geo/regions', {
                params: { query }
            });
            if (response.data.success) {
                setOptions(response.data.data);
            }
        } catch (error) {
            console.error('Error loading regions:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.canonical_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange({
            criteria_id: option.criteria_id,
            name: option.name,
            canonical_name: option.canonical_name
        });
        setIsOpen(false);
        setSearchTerm('');
    };

    useEffect(() => {
        if (searchTerm.length > 0) {
            const timeoutId = setTimeout(() => {
                loadRegions(searchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else if (isOpen) {
            loadRegions();
        }
    }, [searchTerm, isOpen]);

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    const selectedRegion = typeof value === 'object' && value !== null ? value : null;
    const displayText = selectedRegion ? selectedRegion.name : placeholder;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed ${
                    required && !value ? 'border-accent-red' : ''
                }`}
            >
                <span className={value ? 'text-text-primary' : 'text-text-muted'}>
                    {displayText}
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
                                placeholder="Поиск региона..."
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
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.criteria_id}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary-bg transition-colors ${
                                        selectedRegion?.criteria_id === option.criteria_id
                                            ? 'bg-accent-blue/10 text-accent-blue' 
                                            : 'text-text-primary'
                                    }`}
                                >
                                    <div className="font-medium">{option.name}</div>
                                    <div className="text-xs text-text-muted">{option.canonical_name}</div>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-text-muted text-center">
                                Регионы не найдены
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

