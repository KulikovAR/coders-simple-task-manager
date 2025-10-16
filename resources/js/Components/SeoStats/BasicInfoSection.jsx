import ScheduleSection from './ScheduleSection';
import ValidationError from './ValidationError';

export default function BasicInfoSection({ siteData, setSiteData, errors, isEditMode = false }) {
    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Основная информация
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Название проекта <span className="text-accent-red">*</span>
                    </label>
                    <input
                        type="text"
                        value={siteData.name}
                        onChange={(e) => setSiteData('name', e.target.value)}
                        className={`w-full px-4 py-3 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors ${
                            errors?.name ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''
                        }`}
                        placeholder="Мой сайт"
                        required
                    />
                    <ValidationError message={errors?.name} />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        URL сайта <span className="text-accent-red">*</span>
                    </label>
                    <input
                        type="url"
                        value={siteData.domain}
                        onChange={(e) => setSiteData('domain', e.target.value)}
                        className={`w-full px-4 py-3 border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors ${
                            isEditMode 
                                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-secondary-bg'
                        } ${
                            errors?.domain ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''
                        }`}
                        placeholder="https://example.com"
                        required
                        disabled={isEditMode}
                    />
                    <ValidationError message={errors?.domain} />
                </div>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Количество позиций для отслеживания
                </label>
                <select
                    value={siteData.position_limit || 10}
                    onChange={(e) => setSiteData('position_limit', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors"
                >
                    <option value={10}>1-10 страниц (10 позиций)</option>
                    <option value={50}>1-50 страниц (50 позиций)</option>
                    <option value={100}>1-100 страниц (100 позиций)</option>
                </select>
                <p className="text-xs text-text-muted mt-2">
                    Определяет максимальное количество позиций, которые будут отслеживаться для каждого ключевого слова
                </p>
                {errors?.position_limit && <p className="text-accent-red text-sm mt-1">{errors.position_limit}</p>}
            </div>

            <div className="mt-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="subdomains"
                            checked={siteData.subdomains || false}
                            onChange={(e) => setSiteData('subdomains', e.target.checked)}
                            className="sr-only"
                        />
                        <label 
                            htmlFor="subdomains"
                            className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                siteData.subdomains 
                                    ? 'bg-accent-blue border-accent-blue' 
                                    : 'bg-secondary-bg border-border-color hover:border-accent-blue/50'
                            }`}
                        >
                            {siteData.subdomains && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </label>
                    </div>
                    <label htmlFor="subdomains" className="flex flex-col cursor-pointer">
                        <span className="text-sm font-medium text-text-primary">Включать поддомены</span>
                        <span className="text-xs text-text-muted">
                            Отслеживать позиции не только основного домена, но и всех его поддоменов
                        </span>
                    </label>
                </div>
                {errors?.subdomains && <p className="text-accent-red text-sm mt-1">{errors.subdomains}</p>}
            </div>

            <ScheduleSection 
                siteData={siteData} 
                setSiteData={setSiteData} 
                errors={errors} 
            />
        </div>
    );
}
