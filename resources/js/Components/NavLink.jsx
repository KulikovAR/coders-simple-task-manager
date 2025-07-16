import { Link } from '@inertiajs/react';

export default function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`nav-link${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
        >
            {children}
        </Link>
    );
}
