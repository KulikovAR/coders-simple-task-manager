import SearchEngineCard from './SearchEngineCard';

export default function SearchEnginesSection({ 
    searchEngines, 
    regions, 
    onEngineToggle, 
    onRegionChange,
    deviceSettings,
    onDeviceSettingsChange,
    wordstatEnabled,
    onWordstatToggle,
    errors = {}
}) {
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
                    device={deviceSettings?.google?.device}
                    onDeviceChange={(device) => onDeviceSettingsChange('google', 'device', device)}
                    os={deviceSettings?.google?.os}
                    onOsChange={(os) => onDeviceSettingsChange('google', 'os', os)}
                    errors={{
                        regions: errors?.regions,
                        device_settings: errors?.device_settings
                    }}
                />

                <SearchEngineCard
                    engine="yandex"
                    isSelected={searchEngines?.includes('yandex') || false}
                    onToggle={() => onEngineToggle('yandex')}
                    region={regions?.yandex}
                    onRegionChange={(region) => onRegionChange('yandex', region)}
                    device={deviceSettings?.yandex?.device}
                    onDeviceChange={(device) => onDeviceSettingsChange('yandex', 'device', device)}
                    os={deviceSettings?.yandex?.os}
                    onOsChange={(os) => onDeviceSettingsChange('yandex', 'os', os)}
                    errors={{
                        regions: errors?.regions,
                        device_settings: errors?.device_settings
                    }}
                />
            </div>

            {/* Wordstat опция */}
            <div className="border border-border-color rounded-lg p-4 bg-card-bg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-blue/10 rounded-lg">
                            <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-medium text-text-primary">Яндекс.Вордстат</h5>
                            <p className="text-sm text-text-muted">Получать частоту запросов из Яндекс.Вордстат</p>
                        </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={wordstatEnabled || false}
                            onChange={(e) => onWordstatToggle(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>
            </div>
        </div>
    );
}
