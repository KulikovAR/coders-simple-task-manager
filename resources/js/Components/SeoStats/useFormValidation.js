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
            const targets = formData.targets || [];
            const targetErrors = {};
            
            formData.search_engines.forEach(engine => {
                const engineTargets = targets.filter(t => t.search_engine === engine);
                
                if (engineTargets.length === 0) {
                    targetErrors[engine] = `Добавьте хотя бы одну комбинацию для ${engine === 'google' ? 'Google' : 'Yandex'}`;
                } else {
                    engineTargets.forEach((target, index) => {
                        if (engine === 'google') {
                            if (!target.domain || (typeof target.domain === 'object' && !target.domain.name)) {
                                targetErrors[`${engine}_${index}_domain`] = 'Выберите домен';
                            }
                            if (!target.region || (typeof target.region === 'object' && !target.region.name)) {
                                targetErrors[`${engine}_${index}_region`] = 'Выберите регион';
                            }
                            if (!target.language) {
                                targetErrors[`${engine}_${index}_language`] = 'Выберите язык';
                            }
                        } else if (engine === 'yandex') {
                            if (!target.lr) {
                                targetErrors[`${engine}_${index}_lr`] = 'Выберите LR';
                            }
                        }
                        
                        if (engine === 'google') {
                            if (!target.device) {
                                targetErrors[`${engine}_${index}_device`] = 'Выберите устройство';
                            }
                            
                            if (target.device === 'mobile' && !target.os) {
                                targetErrors[`${engine}_${index}_os`] = 'Выберите операционную систему';
                            }
                        } else if (engine === 'yandex') {
                            if (!target.os) {
                                targetErrors[`${engine}_${index}_os`] = 'Выберите операционную систему';
                            }
                        }
                    });
                }
            });

            if (Object.keys(targetErrors).length > 0) {
                newErrors.targets = targetErrors;
            }

            if (formData.wordstat_enabled && (!formData.wordstat_region || typeof formData.wordstat_region !== 'number')) {
                newErrors.wordstat_region = 'Выберите регион для Яндекс.Вордстат';
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
                    const targets = formData.targets || [];
                    
                    formData.search_engines.forEach(engine => {
                        const engineTargets = targets.filter(t => t.search_engine === engine);
                        
                        if (engineTargets.length === 0) {
                            searchEngineErrors.push(`targets_${engine}`);
                        } else {
                            engineTargets.forEach((target, index) => {
                                if (engine === 'google') {
                                    if (!target.domain || (typeof target.domain === 'object' && !target.domain.name)) {
                                        searchEngineErrors.push(`target_${engine}_${index}_domain`);
                                    }
                                    if (!target.region || (typeof target.region === 'object' && !target.region.name)) {
                                        searchEngineErrors.push(`target_${engine}_${index}_region`);
                                    }
                                    if (!target.language) {
                                        searchEngineErrors.push(`target_${engine}_${index}_language`);
                                    }
                                } else if (engine === 'yandex') {
                                    if (!target.lr) {
                                        searchEngineErrors.push(`target_${engine}_${index}_lr`);
                                    }
                                }
                                
                                if (engine === 'google') {
                                    if (!target.device) {
                                        searchEngineErrors.push(`target_${engine}_${index}_device`);
                                    }
                                    
                                    if (target.device === 'mobile' && !target.os) {
                                        searchEngineErrors.push(`target_${engine}_${index}_os`);
                                    }
                                } else if (engine === 'yandex') {
                                    if (!target.os) {
                                        searchEngineErrors.push(`target_${engine}_${index}_os`);
                                    }
                                }
                            });
                        }
                    });
                    
                    if (formData.wordstat_enabled && (!formData.wordstat_region || typeof formData.wordstat_region !== 'number')) {
                        searchEngineErrors.push('wordstat_region');
                    }
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
