import { useState, useEffect } from 'react';

export default function XmlApiUrlParser({
    value,
    onChange,
    placeholder = "Введите URL API...",
    className = "",
    allowedDomains = [],
    apiType = 'google'
}) {
    const [mode, setMode] = useState("url"); // url | manual
    const [url, setUrl] = useState('');
    const [parsedData, setParsedData] = useState({ baseUrl: '', userId: '', apiKey: '' });
    const [errors, setErrors] = useState({});

    // Разрешённые домены
    const getAllowedDomains = () => {
        if (apiType === 'google') return ['xmlstock.com', 'xmlriver.com'];
        if (apiType === 'wordstat') return ['xmlriver.com'];
        return allowedDomains;
    };

    // Валидация домена
    const validateDomain = (baseUrl) => {
        if (!baseUrl) return null;
        const allowed = getAllowedDomains().map(d => d.toLowerCase());
        let hostname = baseUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
        const isValid = allowed.some(d => hostname === d || hostname.endsWith(`.${d}`));
        if (!isValid) return `Домен должен быть: ${allowed.join(' или ')}`; 
        return null;
    };

    const normalizeUrl = (str) => {
        if (!str) return str;
        if (/^[a-z]+:\/\//i.test(str)) return str;
        return 'https://' + str;
    };

    // нормализует baseUrl в корневой домен
    const normalizeBaseToRoot = (raw) => {
        if (!raw) return '';
        try {
            const u = new URL(normalizeUrl(raw));
            const hostname = u.hostname.toLowerCase().replace(/^www\./, '');
            const allowed = getAllowedDomains();
            const matched = allowed.find(d => hostname === d || hostname.endsWith(`.${d}`));
            const root = matched || hostname;
            return `${u.protocol}//${root}`;
        } catch (e) {
            const cleaned = raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
            const allowed = getAllowedDomains();
            const matched = allowed.find(d => cleaned === d || cleaned.endsWith(`.${d}`));
            const root = matched || cleaned;
            return `https://${root}`;
        }
    };

    useEffect(() => {
        if (parsedData.baseUrl && !url) {
            // собираем полный URL из базы
            const base = parsedData.baseUrl.replace(/\/+$/, '');
            const p = [];
            if (parsedData.userId) p.push(`user=${parsedData.userId}`);
            if (parsedData.apiKey) p.push(`key=${parsedData.apiKey}`);
            const fullUrl = p.length ? `${base}?${p.join("&")}` : base;

            setUrl(fullUrl);
        }
    }, [parsedData, url]);

    // Init из value
    useEffect(() => {
        if (value && typeof value === 'object') {
            setParsedData(value);
            if (mode === 'manual' && value.baseUrl) {
                const base = value.baseUrl.replace(/\/+$/, '');
                let generated = base + (value.userId ? `?user=${value.userId}` : '') + (value.apiKey ? `${value.userId ? '&' : '?'}key=${value.apiKey}` : '');
                setUrl(generated);
            }
        } else if (value && typeof value === 'string') {
            setUrl(value);
            if (mode === 'url') parseUrl(value);
        }
    }, [value, mode]);

    // Парсинг URL → поля
    const parseUrl = (urlString) => {
        const newErrors = {};
        try {
            const normalized = normalizeUrl(urlString);
            const urlObj = new URL(normalized);
            const params = new URLSearchParams(urlObj.search);
            const userId = params.get('user') || '';
            const apiKey = params.get('key') || '';
            const hostname = urlObj.hostname.toLowerCase();
            const allowed = getAllowedDomains();    
            const matchedDomain = allowed.find(d => hostname === d || hostname.endsWith(`.${d}`));
            const baseUrl = matchedDomain ? `${urlObj.protocol}//${matchedDomain}` : `${urlObj.protocol}//${hostname}`;
            const domainError = validateDomain(baseUrl);
            if (domainError) newErrors.baseUrl = domainError;

            const parsed = { baseUrl, userId, apiKey };
            setParsedData(parsed);
            setErrors(newErrors);
            onChange(parsed, newErrors);
        } catch (error) {
            newErrors.url = 'Некорректный URL';
            setParsedData({ baseUrl: '', userId: '', apiKey: '' });
            setErrors(newErrors);
            onChange({ baseUrl: '', userId: '', apiKey: '' }, newErrors);
        }
    };

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        if (mode === "url") parseUrl(newUrl);
    };  

    const handleFieldChange = (field, value) => {
        let newData = { ...parsedData };
        const newErrors = { ...errors };
        if (field === 'baseUrl') {
            const normalizedBase = normalizeBaseToRoot(value);
            newData.baseUrl = normalizedBase;
            if (mode === 'manual') {
                const domainError = validateDomain(normalizedBase);
                if (domainError) newErrors.baseUrl = domainError;
                else delete newErrors.baseUrl;
            }
        } else {
            newData[field] = value;
        }

        setParsedData(newData);
        setErrors(newErrors);

        if (mode === "manual") {
            const base = (newData.baseUrl || '').replace(/\/+$/, '');
            let generated = base;
            const p = [];
            if (newData.userId) p.push(`user=${newData.userId}`);
            if (newData.apiKey) p.push(`key=${newData.apiKey}`);
            if (p.length) generated += `?${p.join("&")}`;
            setUrl(generated);  
            onChange(newData, newErrors);
            return;
        }

        onChange(newData, newErrors);
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* SELECT режима */}
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Способ ввода</label>
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-3 py-2 border border-border-color bg-secondary-bg rounded-lg"
                >
                    <option value="url">Вставить готовый URL</option>
                    <option value="manual">Ручной ввод параметров</option>
                </select>
            </div>

            {/* URL API */}
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">URL API</label>
                <input
                    type="text"
                    value={url}
                    disabled={mode !== "url"}
                    onChange={handleUrlChange}
                    placeholder={placeholder}   
                    className={`w-full px-3 py-2 border rounded-lg bg-secondary-bg text-text-primary ${mode !== "url" ? "opacity-50 cursor-not-allowed" : ""} ${errors.url ? "border-accent-red" : "border-border-color"}`}
                />
                {errors.url && <p className="mt-1 text-sm text-accent-red">{errors.url}</p>}
            </div>

            {/* Остальные поля */}
            <div className="grid grid-cols-3 gap-3">
                {/* Base URL */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Base URL</label>
                    <input
                        type="text"
                        value={parsedData.baseUrl}
                        disabled={mode !== "manual"}
                        onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
                        placeholder="https://xmlstock.com"
                        className={`w-full px-3 py-2 border rounded-lg bg-secondary-bg text-text-primary ${mode !== "manual" ? "opacity-50 cursor-not-allowed" : ""} ${errors.baseUrl ? "border-accent-red" : "border-border-color"}`}
                    />
                    {errors.baseUrl && <p className="mt-1 text-sm text-accent-red">{errors.baseUrl}</p>}
                </div>

                {/* User ID */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">User ID</label>
                    <input
                        type="text"
                        value={parsedData.userId}
                        disabled={mode !== "manual"}
                        onChange={(e) => handleFieldChange('userId', e.target.value)}
                        placeholder="12345"
                        className={`w-full px-3 py-2 border rounded-lg bg-secondary-bg text-text-primary ${mode !== "manual" ? "opacity-50 cursor-not-allowed" : ""} ${errors.userId ? "border-accent-red" : "border-border-color"}`}
                    />
                </div>

                {/* API Key */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">API Key</label>
                    <input
                        type="text"
                        value={parsedData.apiKey}
                        disabled={mode !== "manual"}
                        onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                        placeholder="a1b2c3..."
                        className={`w-full px-3 py-2 border rounded-lg bg-secondary-bg text-text-primary ${mode !== "manual" ? "opacity-50 cursor-not-allowed" : ""} ${errors.apiKey ? "border-accent-red" : "border-border-color"}`}
                    />
                </div>
            </div>
        </div>
    );
}