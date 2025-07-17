import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="379-task-manager" />
            <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Consolas, monospace' }}>
                <div className="relative flex min-h-screen flex-col items-center justify-center p-6">
                    {/* Header */}
                    <header className="absolute top-0 left-0 right-0 p-6">
                        <nav className="flex justify-between items-center max-w-7xl mx-auto">
                            <div className="text-xl font-bold text-white">
                                379-task-manager
                            </div>
                            <div className="flex space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded transition-colors"
                                    >
                                        dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 text-white hover:text-gray-300 transition-colors"
                                        >
                                            login
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded transition-colors"
                                        >
                                            register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Main Content */}
                    <main className="text-center max-w-2xl mx-auto">
                        <div className="mb-12">
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                379-task-manager
                            </h1>
                            <p className="text-lg text-gray-300 mb-8">
                                task management system for developers
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-6 mb-12 text-left">
                            <div className="border border-gray-700 p-4 rounded">
                                <div className="text-white font-bold">$ projects</div>
                                <div className="text-gray-400 text-sm">create, manage, track</div>
                            </div>
                            
                            <div className="border border-gray-700 p-4 rounded">
                                <div className="text-white font-bold">$ sprints</div>
                                <div className="text-gray-400 text-sm">plan, organize, execute</div>
                            </div>
                            
                            <div className="border border-gray-700 p-4 rounded">
                                <div className="text-white font-bold">$ tasks</div>
                                <div className="text-gray-400 text-sm">assign, comment, complete</div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="space-y-4">
                            {!auth.user ? (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href={route('register')}
                                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded font-bold transition-colors"
                                    >
                                        start
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="px-6 py-3 border border-gray-600 text-white hover:bg-gray-800 rounded transition-colors"
                                    >
                                        login
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded font-bold transition-colors"
                                >
                                    enter
                                </Link>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-16 text-gray-400 text-sm">
                            <p>built for developers</p>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
