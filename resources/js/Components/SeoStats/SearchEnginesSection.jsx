import ToggleSwitch from './ToggleSwitch';
import RegionSelect from './RegionSelect';
import ValidationError from './ValidationError';
import GoogleTargetCard from './GoogleTargetCard';
import YandexTargetCard from './YandexTargetCard';

export default function SearchEnginesSection({
    searchEngines,
    targets,
    onEngineToggle,
    onTargetsChange,
    wordstatEnabled,
    onWordstatToggle,
    wordstatRegion,
    onWordstatRegionChange,
    wordstatOptions = {},
    onWordstatOptionsChange,
    errors = {}
}) {
    const engineConfig = {
        google: {
            name: 'Google',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            )
        },
        yandex: {
            name: 'Yandex',
            icon: (
                <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="12" cy="12" r="11" fill="white" />

                    <g transform="translate(12 12)" fill="none" stroke="#FF0000" strokeWidth="3.2" strokeLinecap="round">

                        <line 
                            x1="0" y1="0"
                            x2={7 * Math.cos(-Math.PI/6)} 
                            y2={7 * Math.sin(-Math.PI/6)} 
                        />

                        <line 
                            x1="0" y1="0"
                            x2={7 * Math.cos(Math.PI/2)} 
                            y2={7 * Math.sin(Math.PI/2)} 
                        />

                        <line 
                            x1="0" y1="0"
                            x2={7 * Math.cos(7*Math.PI/6)} 
                            y2={7 * Math.sin(7*Math.PI/6)} 
                        />
                    </g>
                </svg>
            )
        }
    };

    const googleTargets = targets?.filter(t => t.search_engine === 'google') || [];
    const yandexTargets = targets?.filter(t => t.search_engine === 'yandex') || [];

    const handleGoogleTargetChange = (index, updatedTarget) => {
        const newTargets = [...googleTargets];
        newTargets[index] = updatedTarget;
        const allTargets = [...yandexTargets, ...newTargets];
        onTargetsChange(allTargets);
    };

    const handleGoogleTargetRemove = (index) => {
        const newTargets = googleTargets.filter((_, i) => i !== index);
        const allTargets = [...yandexTargets, ...newTargets];
        onTargetsChange(allTargets);
    };

    const handleAddGoogleTarget = () => {
        const newTarget = {
            search_engine: 'google',
            domain: null,
            region: null,
            language: '',
            device: '',
            os: null,
            enabled: true
        };
        const allTargets = [...targets || [], newTarget];
        onTargetsChange(allTargets);
    };

    const handleYandexTargetChange = (index, updatedTarget) => {
        const newTargets = [...yandexTargets];
        newTargets[index] = updatedTarget;
        const allTargets = [...googleTargets, ...newTargets];
        onTargetsChange(allTargets);
    };

    const handleYandexTargetRemove = (index) => {
        const newTargets = yandexTargets.filter((_, i) => i !== index);
        const allTargets = [...googleTargets, ...newTargets];
        onTargetsChange(allTargets);
    };

    const handleAddYandexTarget = () => {
        const newTarget = {
            search_engine: 'yandex',
            lr: null,
            device: '',
            os: null,
            organic: true,
            enabled: true
        };
        const allTargets = [...targets || [], newTarget];
        onTargetsChange(allTargets);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="border border-border-color rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="google"
                                    checked={searchEngines?.includes('google') || false}
                                    onChange={() => onEngineToggle('google')}
                                    className="sr-only"
                                />
                                <label 
                                    htmlFor="google"
                                    className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                        searchEngines?.includes('google')
                                            ? 'bg-accent-blue border-accent-blue' 
                                            : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                    }`}
                                >
                                    {searchEngines?.includes('google') && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </label>
                            </div>
                            <label htmlFor="google" className="flex items-center gap-2 text-text-primary font-medium cursor-pointer">
                                {engineConfig.google.icon}
                                {engineConfig.google.name}
                            </label>
                        </div>
                    </div>
                    
                    {searchEngines?.includes('google') && (
                        <div className="ml-7 space-y-4">
                            {googleTargets.length === 0 && errors?.targets?.google && (
                                <div className="text-accent-red text-sm mb-2">
                                    {errors.targets.google}
                                </div>
                            )}
                            {googleTargets.map((target, index) => (
                                <GoogleTargetCard
                                    key={index}
                                    target={target}
                                    index={index}
                                    onChange={(updated) => handleGoogleTargetChange(index, updated)}
                                    onRemove={() => handleGoogleTargetRemove(index)}
                                    errors={{
                                        domain: errors?.targets?.[`google_${index}_domain`],
                                        region: errors?.targets?.[`google_${index}_region`],
                                        language: errors?.targets?.[`google_${index}_language`],
                                        device: errors?.targets?.[`google_${index}_device`],
                                        os: errors?.targets?.[`google_${index}_os`],
                                    }}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={handleAddGoogleTarget}
                                className="w-full px-4 py-2 border-2 border-dashed border-border-color rounded-lg text-text-muted hover:border-accent-blue hover:text-accent-blue transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Добавить комбинацию
                            </button>
                        </div>
                    )}
                </div>

                <div className="border border-border-color rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="yandex"
                                    checked={searchEngines?.includes('yandex') || false}
                                    onChange={() => onEngineToggle('yandex')}
                                    className="sr-only"
                                />
                                <label 
                                    htmlFor="yandex"
                                    className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                        searchEngines?.includes('yandex')
                                            ? 'bg-accent-blue border-accent-blue' 
                                            : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                    }`}
                                >
                                    {searchEngines?.includes('yandex') && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </label>
                            </div>
                            <label htmlFor="yandex" className="flex items-center gap-2 text-text-primary font-medium cursor-pointer">
                                {engineConfig.yandex.icon}
                                {engineConfig.yandex.name}
                            </label>
                        </div>
                    </div>
                    
                    {searchEngines?.includes('yandex') && (
                        <div className="ml-7 space-y-4">
                            {yandexTargets.length === 0 && errors?.targets?.yandex && (
                                <div className="text-accent-red text-sm mb-2">
                                    {errors.targets.yandex}
                                </div>
                            )}
                            {yandexTargets.map((target, index) => (
                                <YandexTargetCard
                                    key={index}
                                    target={target}
                                    index={index}
                                    onChange={(updated) => handleYandexTargetChange(index, updated)}
                                    onRemove={() => handleYandexTargetRemove(index)}
                                    errors={{
                                        lr: errors?.targets?.[`yandex_${index}_lr`],
                                        device: errors?.targets?.[`yandex_${index}_device`],
                                        os: errors?.targets?.[`yandex_${index}_os`],
                                    }}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={handleAddYandexTarget}
                                className="w-full px-4 py-2 border-2 border-dashed border-border-color rounded-lg text-text-muted hover:border-accent-blue hover:text-accent-blue transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Добавить LR
                            </button>
                        </div>
                    )}
                </div>
            </div>

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
                    <div className="mt-4 space-y-4">
                        <div>
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

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Типы запросов
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="wordstat-default"
                                            checked={wordstatOptions.default !== false}
                                            onChange={(e) => onWordstatOptionsChange({ ...wordstatOptions, default: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <label 
                                            htmlFor="wordstat-default"
                                            className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                                wordstatOptions.default !== false
                                                    ? 'bg-accent-blue border-accent-blue' 
                                                    : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                            }`}
                                        >
                                            {wordstatOptions.default !== false && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </label>
                                    </div>
                                    <label htmlFor="wordstat-default" className="text-sm text-text-primary cursor-pointer">
                                        Ключевая фраза
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="wordstat-quotes"
                                            checked={wordstatOptions.quotes || false}
                                            onChange={(e) => onWordstatOptionsChange({ ...wordstatOptions, quotes: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <label 
                                            htmlFor="wordstat-quotes"
                                            className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                                wordstatOptions.quotes
                                                    ? 'bg-accent-blue border-accent-blue' 
                                                    : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                            }`}
                                        >
                                            {wordstatOptions.quotes && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </label>
                                    </div>
                                    <label htmlFor="wordstat-quotes" className="text-sm text-text-primary cursor-pointer">
                                        "ключевая фраза"
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="wordstat-quotes-exclamation"
                                            checked={wordstatOptions.quotes_exclamation_marks || false}
                                            onChange={(e) => onWordstatOptionsChange({ ...wordstatOptions, quotes_exclamation_marks: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <label 
                                            htmlFor="wordstat-quotes-exclamation"
                                            className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                                wordstatOptions.quotes_exclamation_marks
                                                    ? 'bg-accent-blue border-accent-blue' 
                                                    : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                            }`}
                                        >
                                            {wordstatOptions.quotes_exclamation_marks && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </label>
                                    </div>
                                    <label htmlFor="wordstat-quotes-exclamation" className="text-sm text-text-primary cursor-pointer">
                                        "!ключевая !фраза"
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="wordstat-exclamation"
                                            checked={wordstatOptions.exclamation_marks || false}
                                            onChange={(e) => onWordstatOptionsChange({ ...wordstatOptions, exclamation_marks: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <label 
                                            htmlFor="wordstat-exclamation"
                                            className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                                wordstatOptions.exclamation_marks
                                                    ? 'bg-accent-blue border-accent-blue' 
                                                    : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                            }`}
                                        >
                                            {wordstatOptions.exclamation_marks && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </label>
                                    </div>
                                    <label htmlFor="wordstat-exclamation" className="text-sm text-text-primary cursor-pointer">
                                        !ключевая фраза
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
