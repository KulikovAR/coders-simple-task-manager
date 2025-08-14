import { useState, useEffect, useContext } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';

import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import NotificationBell from '@/Components/NotificationBell';
import Waves from '@/Components/Waves';
import FlashMessages from '@/Components/FlashMessages';

export default function Authenticated({ user, header, children, flash }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Удаляем атрибут data-page, если он был установлен на лендинге
            document.body.removeAttribute('data-page');
            
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    // Дополнительный useEffect для инициализации при загрузке
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Удаляем атрибут data-page, если он был установлен на лендинге
            document.body.removeAttribute('data-page');
            
            // Восстанавливаем сохраненную тему пользователя
            const savedTheme = localStorage.getItem('theme') || 'dark';
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

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
            <div className="relative z-9999">
            <nav className="border-b border-border-color bg-card-bg/80 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-inset-x">
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
                                            <path d="M3 12H4M12 3V4M20 12H21M12 20V21M5.6 5.6L6.3 6.3M18.4 5.6L17.7 6.3M17.7 17.7L18.4 18.4M6.3 17.7L5.6 18.4M8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                <Dropdown align="right" width="48">
                                    <Dropdown.Trigger>
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
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Профиль
                                            </div>
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('notifications.index')}>
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 20.6302C9.79613 21.2332 10.8475 21.5999 12 21.5999C13.1525 21.5999 14.2039 21.2332 15 20.6302M3.57109 17.5271C3.09677 17.5271 2.83186 16.8206 3.11877 16.4281C3.78453 15.5173 4.42712 14.1814 4.42712 12.5727L4.45458 10.2417C4.45458 5.91078 7.83278 2.3999 12 2.3999C16.2286 2.3999 19.6566 5.9625 19.6566 10.3572L19.6291 12.5727C19.6291 14.1924 20.2495 15.5356 20.8882 16.4468C21.164 16.8403 20.8984 17.5271 20.43 17.5271H3.57109Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Уведомления
                                            </div>
                                        </Dropdown.Link>
                                        <a
                                            href="https://t.me/itteam379manager"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full px-4 py-2 text-start text-sm leading-5 text-text-primary transition duration-150 ease-in-out hover:bg-secondary-bg hover:rounded-lg focus:bg-secondary-bg focus:rounded-lg focus:outline-none"
                                        >
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Поддержка
                                            </div>
                                        </a>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Выйти
                                            </div>
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
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden w-full max-w-full overflow-hidden'}>
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
            <main className="py-12 safe-area-inset-y">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-inset-x">
                    <div className="animate-fade-in">
                        {/* Отображаем flash-сообщения глобально */}
                        <FlashMessages flash={flash} />
                        
                        {children}
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
}
