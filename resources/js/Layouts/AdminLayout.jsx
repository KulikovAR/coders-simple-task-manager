import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function AdminLayout({ user, children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin-theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('admin-theme', theme);
        }
    }, [theme]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="shrink-0 flex items-center">
                                <Link
                                    href="/admin"
                                    className="text-xl font-bold text-red-400 hover:text-red-300 transition-colors"
                                >
                                    🔧 Admin Panel
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href="/admin"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                        route().current('admin.index')
                                            ? 'border-red-400 text-white'
                                            : 'border-transparent text-gray-300 hover:text-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/stats"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                        route().current('admin.stats.*')
                                            ? 'border-red-400 text-white'
                                            : 'border-transparent text-gray-300 hover:text-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    Статистика
                                </Link>
                                <Link
                                    href="/admin/jobs"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                        route().current('admin.jobs.*')
                                            ? 'border-red-400 text-white'
                                            : 'border-transparent text-gray-300 hover:text-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    Tracking Jobs
                                </Link>
                            </div>
                        </div>
                        
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative flex items-center gap-3">
                                {/* Theme Switcher */}
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-700 border border-gray-600 hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/20"
                                    title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                                >
                                    {theme === 'dark' ? (
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 12H4M12 3V4M20 12H21M12 20V21M5.6 5.6L6.3 6.3M18.4 5.6L17.7 6.3M17.7 17.7L18.4 18.4M6.3 17.7L5.6 18.4M8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                                        </svg>
                                    )}
                                </button>

                                {/* User Info */}
                                <div className="flex items-center px-4 py-2 border border-gray-600 text-sm leading-4 font-medium text-gray-300 hover:text-gray-200 hover:bg-gray-700 focus:outline-none transition-all duration-200 bg-gray-700 rounded-xl">
                                    <div className="w-6 h-6 bg-red-400/20 rounded-lg flex items-center justify-center mr-2 overflow-hidden">
                                        <span className="text-xs font-semibold text-red-400">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    {user.name} (Admin)
                                </div>

                                {/* Back to Main App */}
                                <Link
                                    href="/"
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
                                >
                                    ← Main App
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
