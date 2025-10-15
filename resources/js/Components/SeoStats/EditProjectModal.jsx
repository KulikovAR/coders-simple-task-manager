import BasicInfoSection from './BasicInfoSection';
import KeywordsSection from './KeywordsSection';
import SearchEnginesSection from './SearchEnginesSection';

export default function EditProjectModal({ 
    showModal, 
    onClose, 
    project,
    siteData, 
    setSiteData, 
    onSubmit, 
    processing, 
    errors 
}) {
    const handleSearchEngineToggle = (engine) => {
        const currentEngines = siteData.search_engines || [];
        const newEngines = currentEngines.includes(engine)
            ? currentEngines.filter(e => e !== engine)
            : [...currentEngines, engine];
        
        setSiteData('search_engines', newEngines);
        
        // Если убираем поисковик, убираем и его регион
        if (!newEngines.includes(engine)) {
            const newRegions = { ...siteData.regions };
            delete newRegions[engine];
            setSiteData('regions', newRegions);
        }
    };

    const handleRegionChange = (engine, region) => {
        setSiteData('regions', {
            ...siteData.regions,
            [engine]: region
        });
    };

    const handleDeviceSettingsChange = (engine, setting, value) => {
        setSiteData('device_settings', {
            ...siteData.device_settings,
            [engine]: {
                ...siteData.device_settings?.[engine],
                [setting]: value
            }
        });
    };

    const handleKeywordsChange = (keywords) => {
        setSiteData('keywords', keywords);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card-bg border border-border-color rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-text-primary">Редактировать проект</h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors p-2 hover:bg-secondary-bg rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {processing ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        {/* Стильный прелоадер */}
                        <div className="relative mb-8">
                            {/* Внешний круг */}
                            <div className="w-20 h-20 border-4 border-accent-blue/10 rounded-full"></div>
                            {/* Вращающийся круг */}
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-accent-blue border-r-accent-blue rounded-full animate-spin"></div>
                            {/* Внутренний пульсирующий круг */}
                            <div className="absolute top-2 left-2 w-16 h-16 bg-accent-blue/20 rounded-full animate-pulse"></div>
                            {/* Центральная точка */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-accent-blue rounded-full animate-ping"></div>
                        </div>
                        
                        {/* Анимированные точки */}
                        <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-6">
                    <BasicInfoSection 
                        siteData={siteData}
                        setSiteData={setSiteData}
                        errors={errors}
                        isEditMode={true}
                    />

                    <KeywordsSection 
                        keywords={siteData.keywords}
                        onKeywordsChange={handleKeywordsChange}
                        errors={errors}
                    />

                    <SearchEnginesSection 
                        searchEngines={siteData.search_engines}
                        regions={siteData.regions}
                        onEngineToggle={handleSearchEngineToggle}
                        onRegionChange={handleRegionChange}
                        deviceSettings={siteData.device_settings}
                        onDeviceSettingsChange={handleDeviceSettingsChange}
                    />

                    {/* Ошибки для поисковых систем */}
                    {errors?.search_engines && <p className="text-accent-red text-sm mt-1">{errors.search_engines}</p>}
                    {errors?.regions && <p className="text-accent-red text-sm mt-1">{errors.regions}</p>}

                    {/* Кнопки */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-border-color">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-accent-purple text-white px-6 py-2 rounded-lg hover:bg-accent-purple/90 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Сохранить изменения
                                </>
                            )}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
}
