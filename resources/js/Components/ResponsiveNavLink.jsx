import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-accent-blue bg-accent-blue/10 text-accent-blue focus:border-accent-blue focus:bg-accent-blue/20 focus:text-accent-blue'
                    : 'border-transparent text-text-primary hover:border-border-color hover:bg-secondary-bg hover:text-text-primary focus:border-border-color focus:bg-secondary-bg focus:text-text-primary'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
