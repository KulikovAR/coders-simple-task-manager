import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="379ТМ" />
            <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Consolas, monospace' }}>
                <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:p-6">
                    {/* Header */}
                    <header className="absolute top-0 left-0 right-0 p-4 sm:p-6">
                        <nav className="flex justify-between items-center max-w-7xl mx-auto">
                            <div className="text-lg sm:text-xl font-bold text-white">
                                379ТМ
                            </div>
                            <div className="flex space-x-2 sm:space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded text-sm sm:text-base transition-colors"
                                    >
                                        дашборд
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 text-white hover:text-gray-300 transition-colors text-sm sm:text-base"
                                        >
                                            вход
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded text-sm sm:text-base transition-colors"
                                        >
                                            регистрация
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Main Content */}
                    <main className="text-center max-w-2xl mx-auto w-full px-4">
                        <div className="mb-8 sm:mb-12">
                            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
                                379ТМ
                            </h1>
                            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8">
                                система управления задачами для разработчиков
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 text-left">
                            <div className="border border-gray-700 p-3 sm:p-4 rounded">
                                <div className="text-white font-bold text-sm sm:text-base">$ проекты</div>
                                <div className="text-gray-400 text-xs sm:text-sm">создание, управление, отслеживание</div>
                            </div>
                            
                            <div className="border border-gray-700 p-3 sm:p-4 rounded">
                                <div className="text-white font-bold text-sm sm:text-base">$ спринты</div>
                                <div className="text-gray-400 text-xs sm:text-sm">планирование, организация, выполнение</div>
                            </div>
                            
                            <div className="border border-gray-700 p-3 sm:p-4 rounded">
                                <div className="text-white font-bold text-sm sm:text-base">$ задачи</div>
                                <div className="text-gray-400 text-xs sm:text-sm">назначение, комментарии, завершение</div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="space-y-4">
                            {!auth.user ? (
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                    <Link
                                        href={route('register')}
                                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded font-bold transition-colors text-sm sm:text-base"
                                    >
                                        начать
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-600 text-white hover:bg-gray-800 rounded transition-colors text-sm sm:text-base"
                                    >
                                        вход
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded font-bold transition-colors text-sm sm:text-base"
                                >
                                    войти
                                </Link>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-12 sm:mt-16 text-gray-400 text-xs sm:text-sm">
                            <p>создано для разработчиков</p>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
