import { Link } from '@inertiajs/react';

export default function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`nav-link relative group ${active ? 'nav-link-active' : 'nav-link-default'}`}
            aria-current={active ? 'page' : undefined}
        >
            {children}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue rounded-full animate-scale-in"></div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue/20 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
        </Link>
    );
}
