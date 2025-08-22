import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Подтверждение Email" />

            <div className="mb-4 text-sm text-gray-600">
                Спасибо за регистрацию! Прежде чем начать, не могли бы вы подтвердить
                ваш email адрес, кликнув по ссылке, которую мы только что отправили 
                вам? Если вы не получили письмо, мы с радостью отправим вам еще одно.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    Новая ссылка для подтверждения была отправлена на email адрес,
                    который вы указали при регистрации.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Отправить письмо повторно
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Выйти
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
