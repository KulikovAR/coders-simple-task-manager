import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import NotificationBell from '@/Components/NotificationBell';
import Waves from '@/Components/Waves';

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
        <div className="min-h-screen bg-primary-bg text-text-primary relative">
            {/* Waves Background */}
            <Waves
                lineColor={theme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
                backgroundColor="transparent"
                waveSpeedX={0.015}
                waveSpeedY={0.008}
                waveAmpX={25}
                waveAmpY={12}
                friction={0.92}
                tension={0.008}
                maxCursorMove={60}
                xGap={20}
                yGap={50}
            />
            <div className="relative z-10">
            <nav className="border-b border-border-color bg-card-bg/80 backdrop-blur-md shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/dashboard" className="hover:opacity-80 transition-all duration-200 hover:scale-105">
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
                            <div className="ml-3 relative flex items-center gap-3">
                                {/* Theme Switcher */}
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-bg border border-border-color hover:bg-accent-blue/10 hover:border-accent-blue/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:ring-offset-2 focus:ring-offset-card-bg shadow-sm hover:shadow-md"
                                    title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                                >
                                    {theme === 'dark' ? (
                                        <svg className="w-5 h-5 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95-7.07l-.71.71M7.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Notification Bell */}
                                <NotificationBell />

                                {/* Профиль */}
                                <Dropdown align="right" width="64">
                                    <Dropdown.Trigger>
                                        <span className="inline-flex">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 border border-border-color text-sm leading-4 font-medium text-text-primary hover:text-text-secondary hover:bg-secondary-bg focus:outline-none transition-all duration-200 bg-secondary-bg rounded-xl shadow-sm hover:shadow-md"
                                            >
                                                <div className="w-6 h-6 bg-accent-blue/20 rounded-lg flex items-center justify-center mr-2">
                                                    <span className="text-xs font-semibold text-accent-blue">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
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
                                        <div className="px-6 py-4 border-b border-border-color bg-card-bg/80 backdrop-blur-md">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.38 8.38 0 01-7.5-4.36c-.2-.36-.2-.8 0-1.16A8.38 8.38 0 0112 3.5a8.38 8.38 0 017.5 4.36c.2.36.2.8 0 1.16A8.38 8.38 0 0112 20.5z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-base text-text-primary">Тариф</span>
                                            </div>
                                            <div className="flex flex-col gap-3 text-sm">
                                                <div className={`rounded-lg px-4 py-3 flex items-center gap-3 border transition-all duration-200 ${
                                                    !user.paid 
                                                        ? 'border-accent-green/50 bg-accent-green/10 shadow-glow-green' 
                                                        : 'border-border-color bg-secondary-bg/50'
                                                }`}
                                                    style={{ color: !user.paid ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                                                    <div className={`w-2 h-2 rounded-full ${!user.paid ? 'bg-accent-green' : 'bg-text-muted'}`}></div>
                                                    <span className="font-semibold">Базовый</span>
                                                </div>
                                                <div className={`rounded-lg px-4 py-3 flex items-center gap-3 border transition-all duration-200 ${
                                                    user.paid 
                                                        ? 'border-accent-blue/50 bg-accent-blue/10 shadow-glow-blue' 
                                                        : 'border-border-color bg-secondary-bg/50'
                                                }`}
                                                    style={{ color: user.paid ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                                                    <div className={`w-2 h-2 rounded-full ${user.paid ? 'bg-accent-blue' : 'bg-text-muted'}`}></div>
                                                    <span className="font-semibold">ИИ-ассистент</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>Профиль</Dropdown.Link>
                                        <Dropdown.Link href={route('notifications.index')}>
                                            Уведомления
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Выйти
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 text-text-primary hover:text-text-secondary hover:bg-secondary-bg focus:outline-none focus:bg-secondary-bg focus:text-text-secondary transition-all duration-200 rounded-lg"
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
        </div>
    );
}
