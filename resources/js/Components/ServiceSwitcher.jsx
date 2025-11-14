import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ApplicationLogoSeo from '@/Components/ApplicationLogoSeo';

export default function ServiceSwitcher() {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const [currentService, setCurrentService] = useState('379tm');

    // Определяем текущий сервис на основе URL
    useEffect(() => {
        if (url.includes('/seo-stats')) {
            setCurrentService('379seo');
        } else {
            setCurrentService('379tm');
        }
    }, [url]);

    const services = [
        {
            id: '379tm',
            name: '379TM',
            description: 'Таск-менеджер',
            url: '/dashboard',
            logo: <ApplicationLogo className="w-20" />,
            color: 'from-blue-500 to-purple-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-700'
        },
        {
            id: '379seo',
            name: '379SEO',
            description: 'SEO Аналитика',
            url: '/seo-stats',
            logo: <ApplicationLogoSeo className="w-20" />,
            color: 'from-green-500 to-teal-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-700'
        }
        // Легко добавить новые сервисы здесь
    ];

    const handleServiceChange = (service) => {
        setCurrentService(service.id);
        setIsOpen(false);
        if (service.url) {
            router.visit(service.url);
        }
    };

    const currentServiceData = services.find(s => s.id === currentService);
    const otherServices = services.filter(s => s.id !== currentService);

    return (
        <div className="relative">
            {/* Текущий сервис - кнопка для открытия */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-3 px-4 py-2 rounded-xl 
                    bg-secondary-bg border border-border-color 
                    hover:bg-accent-blue/5 hover:border-accent-blue/30 
                    transition-all duration-200 shadow-sm hover:shadow-md
                    ${isOpen ? 'bg-accent-blue/10 border-accent-blue/40' : ''}
                `}
            >
                <div className="scale-75">
                    {currentServiceData?.logo}
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs text-text-muted">
                        {currentServiceData?.description}
                    </span>
                </div>
                <svg 
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown с другими сервисами */}
            {isOpen && (
                <>
                    {/* Overlay для закрытия */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown меню */}
                    <div className="absolute top-full left-0 mt-2 w-80 z-20">
                        <div className="bg-card-bg border border-border-color rounded-xl shadow-xl overflow-hidden">
                            {/* Заголовок */}
                            <div className="px-4 py-3 border-b border-border-color bg-secondary-bg">
                                <h3 className="text-sm font-semibold text-text-primary">
                                    Выберите сервис
                                </h3>
                                <p className="text-xs text-text-muted mt-1">
                                    Переключитесь между доступными сервисами
                                </p>
                            </div>
                            
                            {/* Список сервисов */}
                            <div className="p-2">
                                {otherServices.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => handleServiceChange(service)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-3 rounded-lg
                                            hover:bg-secondary-bg transition-all duration-200
                                            group
                                        `}
                                    >
                                        <div className="scale-75 group-hover:scale-90 transition-transform duration-200">
                                            {service.logo}
                                        </div>
                                        <div className="flex flex-col items-start flex-1">
                                            <span className="text-xs text-text-muted">
                                                {service.description}
                                            </span>
                                        </div>
                                        <svg 
                                            className="w-4 h-4 text-text-muted group-hover:text-accent-blue transition-colors" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Подсказка для будущих сервисов */}
                            <div className="px-4 py-3 border-t border-border-color bg-secondary-bg/50">
                                <p className="text-xs text-text-muted text-center">
                                    Больше сервисов скоро...
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
