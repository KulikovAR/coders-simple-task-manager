import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function GuestLayout({ children }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Удаляем атрибут data-page, если он был установлен на лендинге
            document.body.removeAttribute('data-page');
            
            // Восстанавливаем сохраненную тему пользователя
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center bg-primary-bg pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <ApplicationLogo className="h-20 w-20 fill-current text-text-secondary" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden card px-6 py-4 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
