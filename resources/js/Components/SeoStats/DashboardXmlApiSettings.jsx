import {useEffect, useState} from 'react';
import XmlApiUrlParser from './XmlApiUrlParser';

export default function DashboardXmlApiSettings() {
    const [googleApiData, setGoogleApiData] = useState({
        baseUrl: '',
        userId: '',
        apiKey: ''
    });

    const [wordstatApiData, setWordstatApiData] = useState({
        baseUrl: '',
        userId: '',
        apiKey: ''
    });

    const [googleApiErrors, setGoogleApiErrors] = useState({});
    const [wordstatApiErrors, setWordstatApiErrors] = useState({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await fetch('/user/xml-api-settings', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setGoogleApiData(data.data.google_api);
                    setWordstatApiData(data.data.wordstat_api);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleApiChange = (data, errors = {}) => {
        setGoogleApiData(data);
        setGoogleApiErrors(errors);
    };

    const handleWordstatApiChange = (data, errors = {}) => {
        setWordstatApiData(data);
        setWordstatApiErrors(errors);
    };

    const handleSave = async () => {
        // Проверяем наличие ошибок валидации
        const hasErrors = Object.keys(googleApiErrors).length > 0 || Object.keys(wordstatApiErrors).length > 0;

        if (hasErrors) {
            alert('Пожалуйста, исправьте ошибки валидации перед сохранением');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/user/xml-api-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    google_api: googleApiData,
                    wordstat_api: wordstatApiData
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert('Настройки XML API сохранены');
                }
            } else {
                alert('Ошибка сохранения настроек');
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения настроек');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-card-bg border border-border-color rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Настройки XML API
            </h2>
            <p className="text-text-muted mb-6">
                Настройте кастомные API для получения данных из поисковых систем.
                Если не указаны, будут использоваться стандартные API.
            </p>

            <div className="space-y-6">
                <div className="border border-border-color rounded-lg p-4 bg-secondary-bg">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        Съем позиций: XMLstock, XMLRiver - Яндекс XML Search Api и парсинг поисковой выдачи Google
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                         Введите ваш API-ключ в поле, укажите полный URL или заполните нужные поля вручную. Если у вас нет API-ключа XMLRiver или XMLstock, зарегистрируйтесь и пополните счёт на сайте  <a target='blank' href={"https://xmlriver.com/"} >https://xmlriver.com/</a> или <a target='blank' href={"https://xmlstock.com/"} >https://xmlstock.com/</a>
                    </p>

                    <XmlApiUrlParser
                        value={googleApiData}
                        onChange={handleGoogleApiChange}
                        placeholder="https://xmlstock.com?user=12345&key=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                        apiType="google"
                    />
                </div>

                <div className="border border-border-color rounded-lg p-4 bg-secondary-bg">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <a href={"https://xmlriver.com/"} target={"_blank"}>
                            <div className="flex items-center gap-2 bg-white/20 p-1 rounded">
                                <img
                                    src="/images/xml-river-logo.png"
                                    alt="XML River"
                                    className="h-8 w-auto"
                                />
                            </div>
                        </a>
                        XMLRiver— используется исключительно для парсинга данных сервиса Яндекс Wordstat.
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                        Введите ваш API-ключ в поле, укажите полный URL или заполните нужные поля вручную. Обратите внимание, что данный ключ используется исключительно для парсинга данных сервиса Яндекс Wordstat. Если у вас нет API-ключа XMLRiver, зарегистрируйтесь и пополните счёт на сайте <a target='blank' href={"https://xmlriver.com/"} >https://xmlriver.com/</a>
                    </p>

                    <XmlApiUrlParser
                        value={wordstatApiData}
                        onChange={handleWordstatApiChange}
                        placeholder="http://xmlriver.com?user=67890&key=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4"
                        apiType="wordstat"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading || saving}
                    className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Сохранение...' : 'Сохранить настройки'}
                </button>
            </div>
        </div>
    );
}
