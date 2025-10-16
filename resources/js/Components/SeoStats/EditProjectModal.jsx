import BasicInfoSection from './BasicInfoSection';
import KeywordsSection from './KeywordsSection';
import SearchEnginesSection from './SearchEnginesSection';
import CollapsibleSection from './CollapsibleSection';
import { useFormValidation } from './useFormValidation';
import ValidationError from './ValidationError';
import ProjectLoadingOverlay from './ProjectLoadingOverlay';

export default function EditProjectModal({ 
    showModal, 
    onClose, 
    project,
    siteData, 
    setSiteData, 
    onSubmit, 
    processing, 
    errors: serverErrors = {}
}) {
    const { errors: validationErrors, validateForm, clearErrors, getSectionStatus } = useFormValidation();
    
    // Объединяем ошибки сервера и валидации
    const allErrors = { ...serverErrors, ...validationErrors };
    
    // Получаем статусы секций
    const basicStatus = getSectionStatus(siteData, 'basic');
    const keywordsStatus = getSectionStatus(siteData, 'keywords');
    const searchEnginesStatus = getSectionStatus(siteData, 'searchEngines');
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

    const handleWordstatToggle = (enabled) => {
        setSiteData('wordstat_enabled', enabled);
    };

    const handleKeywordsChange = (keywords) => {
        setSiteData('keywords', keywords);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Очищаем предыдущие ошибки валидации
        clearErrors();
        
        // Валидируем форму
        const validation = validateForm(siteData);
        
        if (validation.isValid) {
            // Если валидация прошла успешно, отправляем форму
            onSubmit(e);
        } else {
            // Показываем ошибки валидации
            console.log('Validation errors:', validation.errors);
        }
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
                    <ProjectLoadingOverlay 
                        isVisible={true}
                        title="Сохранение изменений"
                        subtitle="Обновляем данные проекта..."
                    />
                ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Основная информация */}
                        <CollapsibleSection
                            title="Основная информация"
                            icon={
                                <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            defaultOpen={false}
                            hasErrors={basicStatus.hasErrors}
                            isValid={basicStatus.isValid}
                        >
                            <BasicInfoSection 
                                siteData={siteData}
                                setSiteData={setSiteData}
                                errors={allErrors}
                                isEditMode={true}
                            />
                        </CollapsibleSection>

                        {/* Ключевые слова */}
                        <CollapsibleSection
                            title="Поисковые запросы"
                            icon={
                                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                            defaultOpen={false}
                            hasErrors={keywordsStatus.hasErrors}
                            isValid={keywordsStatus.isValid}
                        >
                            <KeywordsSection 
                                keywords={siteData.keywords}
                                onKeywordsChange={handleKeywordsChange}
                                errors={allErrors}
                            />
                        </CollapsibleSection>

                        {/* Поисковые системы */}
                        <CollapsibleSection
                            title="Поисковые системы и регионы"
                            icon={
                                <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            defaultOpen={false}
                            hasErrors={searchEnginesStatus.hasErrors}
                            isValid={searchEnginesStatus.isValid}
                        >
                            <SearchEnginesSection 
                                searchEngines={siteData.search_engines}
                                regions={siteData.regions}
                                onEngineToggle={handleSearchEngineToggle}
                                onRegionChange={handleRegionChange}
                                deviceSettings={siteData.device_settings}
                                onDeviceSettingsChange={handleDeviceSettingsChange}
                                wordstatEnabled={siteData.wordstat_enabled}
                                onWordstatToggle={handleWordstatToggle}
                                errors={allErrors}
                            />
                            
                            {/* Общие ошибки для поисковых систем */}
                            <ValidationError message={allErrors?.search_engines} />
                        </CollapsibleSection>

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
