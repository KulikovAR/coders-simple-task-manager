import LrSelect from './LrSelect';
import ValidationError from './ValidationError';

export default function YandexTargetCard({
    target,
    index,
    onChange,
    onRemove,
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
                        LR <span className="text-accent-red">*</span>
                    </label>
                    <LrSelect
                        value={target.lr || null}
                        onChange={(value) => handleChange('lr', value)}
                        placeholder="Выберите регион"
                        required
                        disabled={!!target.id}
                        className={errors?.lr ? 'border-accent-red' : ''}
                    />
                    <ValidationError message={errors?.lr} />
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
                            onChange={(e) => handleChange('os', e.target.value || null)}
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

                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={target.organic !== false}
                                onChange={(e) => handleChange('organic', e.target.checked)}
                                disabled={!!target.id}
                                className="sr-only"
                            />
                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                target.organic !== false
                                    ? 'bg-accent-blue border-accent-blue'
                                    : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                            } ${target.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {target.organic !== false && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-sm font-medium text-text-primary">Яндекс Live</span>
                    </label>
                    <p className="text-xs text-text-muted mt-1 ml-7">
                        Если выключено, стоимость рассчитывается как для 1 страницы независимо от лимита позиций
                    </p>
                </div>

                {target.id && (
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={target.enabled !== false}
                                    onChange={(e) => handleChange('enabled', e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                    target.enabled !== false
                                        ? 'bg-accent-blue border-accent-blue'
                                        : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                                }`}>
                                    {target.enabled !== false && (
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

