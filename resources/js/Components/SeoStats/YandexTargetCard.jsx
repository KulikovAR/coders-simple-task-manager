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
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-accent-red hover:text-accent-red/80 transition-colors p-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
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
                        className={`w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 ${
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
                            className={`w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 ${
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
            </div>
        </div>
    );
}

