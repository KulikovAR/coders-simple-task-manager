import SearchEngineCard from './SearchEngineCard';

export default function SearchEnginesSection({ 
    searchEngines, 
    regions, 
    onEngineToggle, 
    onRegionChange,
    deviceSettings,
    onDeviceSettingsChange
}) {
    const googleRegions = [
        { value: 'ru', label: 'Россия' },
        { value: 'us', label: 'США' },
        { value: 'uk', label: 'Великобритания' },
        { value: 'de', label: 'Германия' },
        { value: 'fr', label: 'Франция' },
        { value: 'es', label: 'Испания' },
        { value: 'it', label: 'Италия' },
        { value: 'ca', label: 'Канада' },
        { value: 'au', label: 'Австралия' },
        { value: 'jp', label: 'Япония' },
        { value: 'cn', label: 'Китай' },
        { value: 'br', label: 'Бразилия' },
        { value: 'in', label: 'Индия' }
    ];

    const yandexRegions = [
        { value: 'ru', label: 'Россия' },
        { value: 'ua', label: 'Украина' },
        { value: 'by', label: 'Беларусь' },
        { value: 'kz', label: 'Казахстан' },
        { value: 'tr', label: 'Турция' }
    ];

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Поисковые системы и регионы
            </h4>
            
            <div className="space-y-4">
                <SearchEngineCard
                    engine="google"
                    isSelected={searchEngines?.includes('google') || false}
                    onToggle={() => onEngineToggle('google')}
                    region={regions?.google}
                    onRegionChange={(region) => onRegionChange('google', region)}
                    regions={googleRegions}
                    device={deviceSettings?.google?.device}
                    onDeviceChange={(device) => onDeviceSettingsChange('google', 'device', device)}
                    os={deviceSettings?.google?.os}
                    onOsChange={(os) => onDeviceSettingsChange('google', 'os', os)}
                />

                <SearchEngineCard
                    engine="yandex"
                    isSelected={searchEngines?.includes('yandex') || false}
                    onToggle={() => onEngineToggle('yandex')}
                    region={regions?.yandex}
                    onRegionChange={(region) => onRegionChange('yandex', region)}
                    regions={yandexRegions}
                    device={deviceSettings?.yandex?.device}
                    onDeviceChange={(device) => onDeviceSettingsChange('yandex', 'device', device)}
                    os={deviceSettings?.yandex?.os}
                    onOsChange={(os) => onDeviceSettingsChange('yandex', 'os', os)}
                />
            </div>
        </div>
    );
}
