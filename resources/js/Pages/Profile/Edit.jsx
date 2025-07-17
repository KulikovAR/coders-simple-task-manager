import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
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
        </AuthenticatedLayout>
    );
}
