import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
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
