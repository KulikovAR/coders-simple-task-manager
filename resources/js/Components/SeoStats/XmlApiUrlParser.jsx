import { useState, useEffect } from 'react';

export default function XmlApiUrlParser({ 
    value, 
    onChange, 
    placeholder = "Введите URL API...",
    className = "",
    allowedDomains = [],
    apiType = 'google' // 'google' или 'wordstat'
}) {
    const [url, setUrl] = useState('');
    const [parsedData, setParsedData] = useState({
        baseUrl: '',
        userId: '',
        apiKey: ''
    });
    const [errors, setErrors] = useState({});

    // Определяем разрешенные домены в зависимости от типа API
    const getAllowedDomains = () => {
        if (apiType === 'google') {
            return ['https://xmlstock.com'];
        } else if (apiType === 'wordstat') {
            return ['http://xmlriver.com'];
        }
        return allowedDomains;
    };

    // Функция валидации домена
    const validateDomain = (baseUrl) => {
        const allowedDomains = getAllowedDomains();
        const isValid = allowedDomains.some(domain => baseUrl.startsWith(domain));
        
        if (!isValid && baseUrl) {
            const domainNames = allowedDomains.map(d => d.replace(/^https?:\/\//, '')).join(' или ');
            return `Домен должен быть: ${domainNames}`;
        }
        return null;
    };

    useEffect(() => {
        if (value && typeof value === 'object') {
            setParsedData(value);
            // Создаем URL из объекта для отображения
            const urlString = value.baseUrl ? `${value.baseUrl}?user=${value.userId}&key=${value.apiKey}` : '';
            setUrl(urlString);
        } else if (value && typeof value === 'string') {
            setUrl(value);
            parseUrl(value);
        }
    }, [value]);

    const parseUrl = (urlString) => {
        const newErrors = {};
        
        try {
            const url = new URL(urlString);
            const params = new URLSearchParams(url.search);
            
            const userId = params.get('user') || '';
            const apiKey = params.get('key') || '';
            const baseUrl = `${url.protocol}//${url.host}`;
            
            // Валидация домена
            const domainError = validateDomain(baseUrl);
            if (domainError) {
                newErrors.baseUrl = domainError;
            }
            
            const parsed = {
                baseUrl,
                userId,
                apiKey
            };
            
            setParsedData(parsed);
            setErrors(newErrors);
            onChange(parsed, newErrors);
        } catch (error) {
            newErrors.url = 'Некорректный URL';
            setParsedData({
                baseUrl: '',
                userId: '',
                apiKey: ''
            });
            setErrors(newErrors);
            onChange({
                baseUrl: '',
                userId: '',
                apiKey: ''
            }, newErrors);
        }
    };

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        parseUrl(newUrl);
    };

    const handleFieldChange = (field, value) => {
        const newData = { ...parsedData, [field]: value };
        const newErrors = { ...errors };
        
        // Валидация домена при изменении baseUrl
        if (field === 'baseUrl') {
            const domainError = validateDomain(value);
            if (domainError) {
                newErrors.baseUrl = domainError;
            } else {
                delete newErrors.baseUrl;
            }
        }
        
        setParsedData(newData);
        setErrors(newErrors);
        onChange(newData, newErrors);
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    URL API
                </label>
                <input
                    type="url"
                    value={url}
                    onChange={handleUrlChange}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 border rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 ${
                        errors.url ? 'border-accent-red' : 'border-border-color'
                    }`}
                />
                {errors.url && (
                    <p className="mt-1 text-sm text-accent-red">{errors.url}</p>
                )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Base URL
                    </label>
                    <input
                        type="text"
                        value={parsedData.baseUrl}
                        onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
                        placeholder="https://api.example.com"
                        className={`w-full px-3 py-2 border rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 ${
                            errors.baseUrl ? 'border-accent-red' : 'border-border-color'
                        }`}
                    />
                    {errors.baseUrl && (
                        <p className="mt-1 text-sm text-accent-red">{errors.baseUrl}</p>
                    )}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        User ID
                    </label>
                    <input
                        type="text"
                        value={parsedData.userId}
                        onChange={(e) => handleFieldChange('userId', e.target.value)}
                        placeholder="12345"
                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        API Key
                    </label>
                    <input
                        type="text"
                        value={parsedData.apiKey}
                        onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                        placeholder="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                        className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                    />
                </div>
            </div>
        </div>
    );
}
