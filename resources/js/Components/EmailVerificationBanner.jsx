import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function EmailVerificationBanner({ user, status, isNewUser = false }) {
    const [isResending, setIsResending] = useState(false);

    const handleResendVerification = () => {
        setIsResending(true);
        router.post(route('verification.send'), {}, {
            onFinish: () => setIsResending(false),
        });
    };

    if (user.email_verified_at) {
        return null;
    }

    // Для старых пользователей показываем плашку только в профиле
    if (!isNewUser) {
        return null;
    }

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Email не подтвержден
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p>
                            Для полного доступа к функциям приложения необходимо подтвердить ваш email адрес.
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-medium text-green-800">
                                Ссылка для подтверждения была отправлена на ваш email.
                            </p>
                        )}
                    </div>
                    <div className="mt-4">
                        <div className="-mx-2 -my-1.5 flex">
                            <button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResending ? 'Отправка...' : 'Отправить повторно'}
                            </button>
                            <a
                                href={route('verification.notice')}
                                className="ml-3 bg-yellow-100 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                            >
                                Подтвердить email
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
