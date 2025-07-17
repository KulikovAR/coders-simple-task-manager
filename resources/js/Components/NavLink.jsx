import { Link } from '@inertiajs/react';

export default function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`nav-link ${active ? 'nav-link-active' : 'nav-link-default'}`}
            aria-current={active ? 'page' : undefined}
        >
            {children}
        </Link>
    );
}
