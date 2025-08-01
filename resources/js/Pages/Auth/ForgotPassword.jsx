import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Забыли пароль" />

            <div className="mb-4 text-sm text-gray-600">
                Забыли пароль? Не проблема. Просто сообщите нам свой email, и мы отправим вам ссылку для сброса пароля.
            </div>

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                    {errors.email && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                            {errors.email}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton className="ml-4" disabled={processing}>
                        Отправить ссылку для сброса пароля
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
