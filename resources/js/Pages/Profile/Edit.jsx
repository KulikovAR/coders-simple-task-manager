import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateEmailNotificationsForm from './Partials/UpdateEmailNotificationsForm';
import PaymentModal from '@/Components/PaymentModal';
import { useState } from 'react';

export default function Edit({ auth, mustVerifyEmail, status, user }) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handlePay = () => {
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
    };

    const isPaid = user?.paid && (!user?.expires_at || new Date(user.expires_at) > new Date());
    const expiresAt = user?.expires_at ? new Date(user.expires_at).toLocaleDateString() : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    Профиль
                </h2>
            }
        >
            <Head title="Профиль" />

            <div className="space-y-8">
                {/* Заголовок */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        Настройки профиля
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Управление личной информацией и безопасностью
                    </p>
                </div>

                {/* Основная информация */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center">
                            <svg className="w-5 h-5 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Основная информация
                        </h3>
                        <p className="text-text-secondary text-sm">
                            Обновите ваше имя и email
                        </p>
                    </div>
                    <div className="card-body">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                        {/* Статус подписки и кнопка оплаты */}
                        <div className="mt-6 p-6 rounded-lg bg-secondary-bg border border-border-color text-sm">
                            <div className="mb-4 font-semibold text-base text-text-primary flex items-center gap-2">
                                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.38 8.38 0 01-7.5-4.36c-.2-.36-.2-.8 0-1.16A8.38 8.38 0 0112 3.5a8.38 8.38 0 017.5 4.36c.2.36.2.8 0 1.16A8.38 8.38 0 0112 20.5z" /></svg>
                                Тариф
                            </div>
                            <div className="flex flex-col gap-3 mb-4">
                                <div className={`rounded px-3 py-3 flex items-center gap-3 border ${!isPaid ? 'border-green-500 bg-green-500/10' : 'border-border-color'}`} style={{ color: !isPaid ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    <span className="font-bold">Базовый</span>
                                    <span className="ml-auto text-gray-400">0 ₽/мес</span>
                                    {!isPaid && (
                                        <>
                                            <span className="ml-2 text-green-400 font-semibold flex items-center">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Активен
                                            </span>
                                            <span className="ml-2 text-xs text-gray-400">Ваш тариф</span>
                                        </>
                                    )}
                                </div>
                                <div className={`rounded px-3 py-3 flex items-center gap-3 border ${isPaid ? 'border-blue-500 bg-blue-500/10' : 'border-border-color'}`} style={{ color: isPaid ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    <span className="font-bold">ИИ-ассистент</span>
                                    <span className="ml-auto text-gray-400">2000 ₽/мес или 20000 ₽/год</span>
                                    {isPaid && (
                                        <>
                                            <span className="ml-2 text-green-400 font-semibold flex items-center">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Активен
                                            </span>
                                            <span className="ml-2 text-xs text-gray-400">Ваш тариф</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mb-2 text-xs text-gray-400">
                                <div><span className="font-bold">Базовый</span>: доступ к проектам и задачам, без ИИ-ассистента.</div>
                                <div><span className="font-bold">ИИ-ассистент</span>: генерация задач, советы и помощь от ИИ.</div>
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold">Статус подписки:</span>{' '}
                                {isPaid ? (
                                    <span className="text-green-400 font-bold">Активна{expiresAt && ` до ${expiresAt}`}</span>
                                ) : (
                                    <span className="text-red-400 font-bold">Неактивна</span>
                                )}
                            </div>
                            {!isPaid && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handlePay}
                                >
                                    Оплатить подписку
                                </button>
                            )}
                            {isPaid && expiresAt && (
                                <div className="text-xs text-gray-500 mt-2">Подписка продлевается вручную</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email уведомления */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center">
                            <svg className="w-5 h-5 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email уведомления
                        </h3>
                        <p className="text-text-secondary text-sm">
                            Настройте получение уведомлений на email
                        </p>
                    </div>
                    <div className="card-body">
                        <UpdateEmailNotificationsForm className="max-w-xl" user={user} />
                    </div>
                </div>

                {/* Смена пароля */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center">
                            <svg className="w-5 h-5 mr-2 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Смена пароля
                        </h3>
                        <p className="text-text-secondary text-sm">
                            Обновите пароль для безопасности аккаунта
                        </p>
                    </div>
                    <div className="card-body">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>

                {/* Удаление аккаунта */}
                <div className="card border-accent-red/20">
                    <div className="card-header">
                        <h3 className="card-title flex items-center text-accent-red">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Удаление аккаунта
                        </h3>
                        <p className="text-text-secondary text-sm">
                            Безвозвратное удаление аккаунта и всех данных
                        </p>
                    </div>
                    <div className="card-body">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>

            {/* Модалка оплаты подписки */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={closePaymentModal}
            />
        </AuthenticatedLayout>
    );
}
