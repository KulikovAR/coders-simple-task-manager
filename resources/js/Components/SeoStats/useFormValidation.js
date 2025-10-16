import { useState, useCallback } from 'react';

export function useFormValidation() {
    const [errors, setErrors] = useState({});
    const [isValidating, setIsValidating] = useState(false);

    const validateForm = useCallback((formData) => {
        setIsValidating(true);
        const newErrors = {};

        // Валидация основных полей
        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Название проекта обязательно для заполнения';
        }

        if (!formData.domain || formData.domain.trim() === '') {
            newErrors.domain = 'URL сайта обязателен для заполнения';
        } else {
            // Простая валидация URL
            try {
                new URL(formData.domain);
            } catch {
                newErrors.domain = 'Введите корректный URL сайта';
            }
        }

        if (!formData.keywords || formData.keywords.trim() === '') {
            newErrors.keywords = 'Ключевые слова обязательны для заполнения';
        } else {
            // Проверяем, что есть хотя бы одно ключевое слово
            const keywordsList = formData.keywords.split('\n').filter(kw => kw.trim() !== '');
            if (keywordsList.length === 0) {
                newErrors.keywords = 'Введите хотя бы одно ключевое слово';
            }
        }

        // Валидация поисковых систем
        if (!formData.search_engines || formData.search_engines.length === 0) {
            newErrors.search_engines = 'Выберите хотя бы одну поисковую систему';
        } else {
            // Валидация регионов для выбранных поисковиков
            const regionErrors = {};
            let hasRegionErrors = false;

            formData.search_engines.forEach(engine => {
                if (!formData.regions || !formData.regions[engine]) {
                    regionErrors[engine] = `Выберите регион для ${engine === 'google' ? 'Google' : 'Yandex'}`;
                    hasRegionErrors = true;
                } else if (!formData.regions[engine].code || !formData.regions[engine].name) {
                    regionErrors[engine] = `Выберите корректный регион для ${engine === 'google' ? 'Google' : 'Yandex'}`;
                    hasRegionErrors = true;
                }
            });

            if (hasRegionErrors) {
                newErrors.regions = regionErrors;
            }

            // Валидация настроек устройств для выбранных поисковиков
            const deviceErrors = {};
            let hasDeviceErrors = false;

            formData.search_engines.forEach(engine => {
                if (!formData.device_settings || !formData.device_settings[engine]) {
                    deviceErrors[engine] = `Выберите устройство для ${engine === 'google' ? 'Google' : 'Yandex'}`;
                    hasDeviceErrors = true;
                } else if (!formData.device_settings[engine].device) {
                    deviceErrors[engine] = `Выберите устройство для ${engine === 'google' ? 'Google' : 'Yandex'}`;
                    hasDeviceErrors = true;
                } else if (formData.device_settings[engine].device === 'mobile' && !formData.device_settings[engine].os) {
                    deviceErrors[engine] = `Выберите операционную систему для мобильного устройства в ${engine === 'google' ? 'Google' : 'Yandex'}`;
                    hasDeviceErrors = true;
                }
            });

            if (hasDeviceErrors) {
                newErrors.device_settings = deviceErrors;
            }
        }

        setErrors(newErrors);
        setIsValidating(false);

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const setFieldError = useCallback((field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    }, []);

    const clearFieldError = useCallback((field) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const getSectionStatus = useCallback((formData, section) => {
        switch (section) {
            case 'basic':
                const basicErrors = [];
                if (!formData.name || formData.name.trim() === '') {
                    basicErrors.push('name');
                }
                if (!formData.domain || formData.domain.trim() === '') {
                    basicErrors.push('domain');
                } else {
                    try {
                        new URL(formData.domain);
                    } catch {
                        basicErrors.push('domain');
                    }
                }
                return {
                    hasErrors: basicErrors.length > 0,
                    isValid: basicErrors.length === 0 && formData.name && formData.domain,
                    errors: basicErrors
                };

            case 'keywords':
                const keywordErrors = [];
                if (!formData.keywords || formData.keywords.trim() === '') {
                    keywordErrors.push('keywords');
                } else {
                    const keywordsList = formData.keywords.split('\n').filter(kw => kw.trim() !== '');
                    if (keywordsList.length === 0) {
                        keywordErrors.push('keywords');
                    }
                }
                return {
                    hasErrors: keywordErrors.length > 0,
                    isValid: keywordErrors.length === 0 && formData.keywords,
                    errors: keywordErrors
                };

            case 'searchEngines':
                const searchEngineErrors = [];
                if (!formData.search_engines || formData.search_engines.length === 0) {
                    searchEngineErrors.push('search_engines');
                } else {
                    // Проверяем регионы
                    formData.search_engines.forEach(engine => {
                        if (!formData.regions || !formData.regions[engine] || !formData.regions[engine].code) {
                            searchEngineErrors.push(`region_${engine}`);
                        }
                    });
                    
                    // Проверяем настройки устройств
                    formData.search_engines.forEach(engine => {
                        if (!formData.device_settings || !formData.device_settings[engine] || !formData.device_settings[engine].device) {
                            searchEngineErrors.push(`device_${engine}`);
                        } else if (formData.device_settings[engine].device === 'mobile' && !formData.device_settings[engine].os) {
                            searchEngineErrors.push(`os_${engine}`);
                        }
                    });
                }
                return {
                    hasErrors: searchEngineErrors.length > 0,
                    isValid: searchEngineErrors.length === 0 && formData.search_engines && formData.search_engines.length > 0,
                    errors: searchEngineErrors
                };

            default:
                return { hasErrors: false, isValid: false, errors: [] };
        }
    }, []);

    return {
        errors,
        isValidating,
        validateForm,
        clearErrors,
        setFieldError,
        clearFieldError,
        getSectionStatus
    };
}
