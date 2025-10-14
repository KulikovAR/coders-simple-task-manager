import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ApplicationLogoSeo from '@/Components/ApplicationLogoSeo';

export default function ServiceSelector() {
    const { url } = usePage();
    const [currentService, setCurrentService] = useState('379tm'); // По умолчанию 379tm

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
            description: 'Task Manager',
            url: '/dashboard',
            logo: <ApplicationLogo className="w-16" />
        },
        {
            id: '379seo',
            name: '379SEO',
            description: 'SEO Analytics',
            url: '/seo-stats',
            logo: <ApplicationLogoSeo className="w-16" />
        }
    ];

    const handleServiceChange = (service) => {
        setCurrentService(service.id);
        // Используем Inertia.js для навигации
        if (service.url) {
            router.visit(service.url);
        }
    };

    const currentServiceData = services.find(s => s.id === currentService);

    return (
        <div className="flex items-center space-x-2">
            {services
                .filter(service => service.id !== currentService) // Показываем только неактивный сервис
                .map((service) => (
                    <button
                        key={service.id}
                        onClick={() => handleServiceChange(service)}
                        className="px-3 py-2 rounded-lg transition-all duration-200 bg-secondary-bg text-text-primary border border-border-color hover:bg-accent-blue/5 hover:border-accent-blue/20"
                        title={`Перейти в ${service.name}`}
                    >
                        <div className="scale-50">
                            {service.logo}
                        </div>
                    </button>
                ))}
        </div>
    );
}
