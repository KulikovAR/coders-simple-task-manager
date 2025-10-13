import BasicInfoSection from './BasicInfoSection';
import KeywordsSection from './KeywordsSection';
import SearchEnginesSection from './SearchEnginesSection';

export default function CreateSiteModal({ 
    showModal, 
    onClose, 
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
                    <h3 className="text-2xl font-bold text-text-primary">Создать новый проект</h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors p-2 hover:bg-secondary-bg rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <BasicInfoSection 
                        siteData={siteData}
                        setSiteData={setSiteData}
                        errors={errors}
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
                            className="bg-accent-blue text-white px-6 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Создать проект
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
