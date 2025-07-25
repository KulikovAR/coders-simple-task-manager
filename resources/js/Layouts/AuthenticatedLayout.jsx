import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    // Проверяем, что user существует
    if (!user) {
        return null; // или можно показать загрузку
    }

    return (
        <div className="min-h-screen bg-primary-bg text-text-primary">
            <nav className="border-b border-border-color bg-card-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-text-primary" />
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('projects.index')} active={route().current('projects.*')}>
                                    Проекты
                                </NavLink>
                                <NavLink href={route('tasks.index')} active={route().current('tasks.*')}>
                                    Задачи
                                </NavLink>
                            </div>
                        </div>
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative flex items-center gap-2">
                                {/* Профиль */}
                                <Dropdown align="right" width="64">
                                    <Dropdown.Trigger>
                                        <span className="inline-flex">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-text-primary hover:text-text-secondary focus:outline-none transition ease-in-out duration-150 bg-transparent rounded-full"
                                            >
                                                {user.name}
                                                <svg
                                                    className="ml-2 -mr-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <div className="px-6 py-4 border-b border-border-color bg-[#181A20]">
                                            <div className="flex items-center gap-3 mb-3">
                                                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.38 8.38 0 01-7.5-4.36c-.2-.36-.2-.8 0-1.16A8.38 8.38 0 0112 3.5a8.38 8.38 0 017.5 4.36c.2.36.2.8 0 1.16A8.38 8.38 0 0112 20.5z" />
                                                </svg>
                                                <span className="font-semibold text-base text-text-primary">Тариф</span>
                                            </div>
                                            <div className="flex flex-col gap-3 text-sm">
                                                <div className={`rounded px-3 py-3 flex items-center gap-3 border ${!user.paid ? 'border-green-500 bg-green-900/20' : 'border-border-color'}`}
                                                    style={{ color: !user.paid ? '#fff' : '#aaa' }}>
                                                    <span className="font-bold">Базовый</span>


                                                </div>
                                                <div className={`rounded px-3 py-3 flex items-center gap-3 border ${user.paid ? 'border-blue-500 bg-blue-900/20' : 'border-border-color'}`}
                                                    style={{ color: user.paid ? '#fff' : '#aaa' }}>
                                                    <span className="font-bold">ИИ-ассистент</span>


                                                </div>
                                            </div>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>Профиль</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Выйти
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>

                                {/* Theme Switcher */}
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-bg border border-border-color hover:bg-accent-blue/10 transition-colors focus:outline-none"
                                    title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                                >
                                    {theme === 'dark' ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 12H4M12 3V4M20 12H21M12 20V21M5.6 5.6L6.3 6.3M18.4 5.6L17.7 6.3M17.7 17.7L18.4 18.4M6.3 17.7L5.6 18.4M8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12Z" stroke="#FCAC38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 text-text-primary hover:text-text-secondary hover:bg-secondary-bg focus:outline-none focus:bg-secondary-bg focus:text-text-secondary transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('projects.index')} active={route().current('projects.*')}>
                            Проекты
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('tasks.index')} active={route().current('tasks.*')}>
                            Задачи
                        </ResponsiveNavLink>
                    </div>
                    <div className="pt-4 pb-1 border-t border-border-color">
                        <div className="px-4">
                            <div className="font-medium text-base text-text-primary">{user.name}</div>
                            <div className="font-medium text-sm text-text-muted">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Профиль</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Выйти
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>
            {/* header удалён по требованию пользователя */}
            <main className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
