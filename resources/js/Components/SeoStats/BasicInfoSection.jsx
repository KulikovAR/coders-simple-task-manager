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
                        Название проекта
                    </label>
                    <input
                        type="text"
                        value={siteData.name}
                        onChange={(e) => setSiteData('name', e.target.value)}
                        className="w-full px-4 py-3 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors"
                        placeholder="Мой сайт"
                        required
                    />
                    {errors?.name && <p className="text-accent-red text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        URL сайта
                    </label>
                    <input
                        type="url"
                        value={siteData.domain}
                        onChange={(e) => setSiteData('domain', e.target.value)}
                        className={`w-full px-4 py-3 border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors ${
                            isEditMode 
                                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-secondary-bg'
                        }`}
                        placeholder="https://example.com"
                        required
                        disabled={isEditMode}
                    />
                    {errors?.domain && <p className="text-accent-red text-sm mt-1">{errors.domain}</p>}
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
        </div>
    );
}
