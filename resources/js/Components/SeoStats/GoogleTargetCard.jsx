import DomainSelect from './DomainSelect';
import RegionSelectFromGeo from './RegionSelectFromGeo';
import LanguageSelect from './LanguageSelect';
import ValidationError from './ValidationError';

export default function GoogleTargetCard({
    target,
    index,
    onChange,
    onRemove,
    isOnlyTarget = false,
    errors = {}
}) {
    const handleChange = (field, value) => {
        onChange({
            ...target,
            [field]: value
        });
    };

    const handleDeviceChange = (device) => {
        const updated = {
            ...target,
            device,
            os: device === 'mobile' ? target.os || null : null
        };
        onChange(updated);
    };

    // Нельзя выключать единственную комбинацию — она должна всегда быть включена
    const canToggleEnabled = !isOnlyTarget;

    return (
        <div className="border border-border-color rounded-lg p-4 bg-secondary-bg/30 space-y-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">Комбинация {index + 1}</span>
                {!target.id && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-accent-red hover:text-accent-red/80 transition-colors p-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Домен <span className="text-accent-red">*</span>
                    </label>
                    <DomainSelect
                        value={target.domain || null}
                        onChange={(value) => handleChange('domain', value)}
                        placeholder="Выберите домен"
                        required
                        disabled={!!target.id}
                        className={errors?.domain ? 'border-accent-red' : ''}
                    />
                    <ValidationError message={errors?.domain} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Регион <span className="text-accent-red">*</span>
                    </label>
                    <RegionSelectFromGeo
                        value={target.region || null}
                        onChange={(value) => handleChange('region', value)}
                        placeholder="Выберите регион"
                        required
                        disabled={!!target.id}
                        className={errors?.region ? 'border-accent-red' : ''}
                    />
                    <ValidationError message={errors?.region} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Язык <span className="text-accent-red">*</span>
                    </label>
                    <LanguageSelect
                        value={target.language || ''}
                        onChange={(value) => handleChange('language', value)}
                        placeholder="Выберите язык"
                        required
                        disabled={!!target.id}
                        className={errors?.language ? 'border-accent-red' : ''}
                    />
                    <ValidationError message={errors?.language} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Устройство <span className="text-accent-red">*</span>
                    </label>
                    <select
                        value={target.device || ''}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        disabled={!!target.id}
                        className={`w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors?.device ? 'border-accent-red' : ''
                        }`}
                        required
                    >
                        <option value="">Выберите устройство</option>
                        <option value="desktop">Компьютер</option>
                        <option value="tablet">Планшет</option>
                        <option value="mobile">Мобильный</option>
                    </select>
                    <ValidationError message={errors?.device} />
                </div>

                {target.device === 'mobile' && (
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            ОС <span className="text-accent-red">*</span>
                        </label>
                        <select
                            value={target.os || ''}
                            onChange={(e) => handleChange('os', e.target.value)}
                            disabled={!!target.id}
                            className={`w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors?.os ? 'border-accent-red' : ''
                            }`}
                            required
                        >
                            <option value="">Выберите ОС</option>
                            <option value="ios">iOS</option>
                            <option value="android">Android</option>
                        </select>
                        <ValidationError message={errors?.os} />
                    </div>
                )}

                {target.id && !isOnlyTarget && (
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isOnlyTarget ? true : target.enabled !== false}
                                    onChange={canToggleEnabled ? (e) => handleChange('enabled', e.target.checked) : undefined}
                                    disabled={!canToggleEnabled}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                    (isOnlyTarget ? true : target.enabled !== false)
                                        ? 'bg-accent-blue border-accent-blue'
                                        : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                } ${!canToggleEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {(isOnlyTarget ? true : target.enabled !== false) && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm font-medium text-text-primary">Включить/Выключить</span>
                        </label>
                        <p className="text-xs text-text-muted mt-1 ml-7">
                            Если выключено, распознавание по этому target не выполняется
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

