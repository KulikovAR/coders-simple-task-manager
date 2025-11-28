import XmlApiUrlParser from './XmlApiUrlParser';

export default function XmlApiSettings({ 
    googleApiData,
    onGoogleApiChange,
    wordstatApiData,
    onWordstatApiChange,
    errors = {}
}) {
    return (
        <div className="space-y-6">
            <div className="border border-border-color rounded-lg p-4 bg-card-bg">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Настройки XML API для Google/Yandex
                </h3>
                <p className="text-sm text-text-muted mb-4">
                    Настройте кастомные API для получения данных из Google и Yandex. 111
                    Можете вставить полный URL или заполнить поля отдельно.
                </p>
                
                <XmlApiUrlParser
                    value={googleApiData}
                    onChange={onGoogleApiChange}
                    placeholder="https://xmlstock.com/search/xml?user=1111&key=142f286c6ca63854027126089a85490b9f9719a4"
                    className={errors?.xml_api ? 'border-accent-red' : ''}
                    apiType="google"
                />
            </div>

            <div className="border border-border-color rounded-lg p-4 bg-card-bg">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Настройки XML API для Вордстат
                </h3>
                <p className="text-sm text-text-muted mb-4">
                    Настройте кастомные API для получения данных из Яндекс.Вордстат.
                </p>
                
                <XmlApiUrlParser
                    value={wordstatApiData}
                    onChange={onWordstatApiChange}
                    placeholder="http://xmlriver.com/wordstat/xml?user=1111&key=142f286c6ca63854027126089a85490b9f9719a4"
                    className={errors?.xml_wordstat_api ? 'border-accent-red' : ''}
                    apiType="wordstat"
                />
            </div>
        </div>
    );
}
