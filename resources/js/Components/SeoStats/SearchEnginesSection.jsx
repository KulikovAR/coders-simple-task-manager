import SearchEngineCard from './SearchEngineCard';
import ToggleSwitch from './ToggleSwitch';
import RegionSelect from './RegionSelect';
import ValidationError from './ValidationError';

export default function SearchEnginesSection({
    searchEngines,
    regions,
    onEngineToggle,
    onRegionChange,
    deviceSettings,
    onDeviceSettingsChange,
    wordstatEnabled,
    onWordstatToggle,
    wordstatRegion,
    onWordstatRegionChange,
    errors = {}
}) {
    return (
        <div className="space-y-4">
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
                <ToggleSwitch
                    checked={wordstatEnabled || false}
                    onChange={onWordstatToggle}
                    label="Яндекс.Вордстат"
                    description="Получать частоту запросов из Яндекс.Вордстат"
                    icon={
                        <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />

                {wordstatEnabled && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Регион для Вордстат <span className="text-accent-red">*</span>
                        </label>
                        <RegionSelect
                            value={wordstatRegion}
                            onChange={onWordstatRegionChange}
                            placeholder="Выберите регион"
                            required={wordstatEnabled}
                            className={errors?.wordstat_region ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''}
                        />
                        <ValidationError message={errors?.wordstat_region} />
                    </div>
                )}
            </div>
        </div>
    );
}
