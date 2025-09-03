import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, post, errors, processing, recentlySuccessful, reset } =
        useForm({
            name: user.name,
            email: user.email,
            telegram_chat_id: user.telegram_chat_id || '',
            email_notifications: user.email_notifications ?? true,
            deadline_notification_time: user.deadline_notification_time ? 
                new Date(user.deadline_notification_time).toTimeString().substring(0, 5) : '09:00',
            avatar: null,
        });

    const [preview, setPreview] = useState(user.avatar ? `/storage/${user.avatar}` : null);
    const fileInputRef = useRef();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setData('avatar', file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(user.avatar ? `/storage/${user.avatar}` : null);
        }
    };

    const handleAvatarButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarRemove = () => {
        setData('avatar', null);
        setPreview(null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            onSuccess: () => {
                if (data.avatar) reset('avatar');
            },
            _method: 'patch',
        });
    };

    return (
        <section className={className}>
            {/* Стили для иконки календаря и времени в темной теме */}
            <style jsx>{`
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator {
                    filter: invert(0);
                }
                .dark input[type="date"]::-webkit-calendar-picker-indicator,
                .dark input[type="time"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                }
                @media (prefers-color-scheme: dark) {
                    input[type="date"]::-webkit-calendar-picker-indicator,
                    input[type="time"]::-webkit-calendar-picker-indicator {
                        filter: invert(1);
                    }
                }
            `}</style>
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Имя" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="telegram_chat_id" value="Telegram chatId" />

                    <TextInput
                        id="telegram_chat_id"
                        className="mt-1 block w-full"
                        value={data.telegram_chat_id}
                        onChange={(e) => setData('telegram_chat_id', e.target.value)}
                        placeholder="Напр. 123456789"
                    />

                    <div className="mt-2 text-xs text-text-muted">
                        Откройте нашего бота в Telegram и отправьте команду <code>/start</code> — бот пришлёт ваш chatId. Вставьте его сюда.
                    </div>

                    <InputError className="mt-2" message={errors.telegram_chat_id} />
                </div>

                <div>
                    <InputLabel htmlFor="avatar" value="Аватарка" />
                    <div className="flex items-center gap-6 mt-2">
                        <div className="w-20 h-20 rounded-full bg-accent-blue/10 flex items-center justify-center overflow-hidden border border-border-color relative">
                            {preview ? (
                                <img src={preview} alt="Аватарка" className="object-cover w-full h-full" />
                            ) : (
                                <span className="text-3xl font-bold text-accent-blue">{user.name.charAt(0).toUpperCase()}</span>
                            )}
                            {preview && (
                                <button type="button" onClick={handleAvatarRemove} className="absolute top-0 right-0 bg-white/80 hover:bg-white text-accent-red rounded-full p-1 shadow transition-all" title="Удалить аватарку">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button type="button" onClick={handleAvatarButtonClick} className="btn btn-secondary px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                                {preview ? 'Изменить аватарку' : 'Загрузить аватарку'}
                            </button>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                            />
                            <InputError className="mt-2" message={errors.avatar} />
                        </div>
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email_notifications" value="Email уведомления" />
                    
                    <div className="mt-2">
                        <label className="flex items-center">
                            <Checkbox
                                name="email_notifications"
                                checked={data.email_notifications}
                                onChange={(e) => setData('email_notifications', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-text-secondary">
                                Получать уведомления на email
                            </span>
                        </label>
                    </div>

                    <div className="mt-2 text-xs text-text-muted">
                        Когда включено, вы будете получать email уведомления о новых задачах, комментариях и других событиях в проектах.
                    </div>

                    <InputError message={errors.email_notifications} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="deadline_notification_time" value="Время уведомлений о дедлайнах" />
                    
                    <div className="mt-2">
                        <input
                            id="deadline_notification_time"
                            type="time"
                            className="mt-1 block w-full border-border-color rounded-md shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm"
                            value={data.deadline_notification_time}
                            onChange={(e) => setData('deadline_notification_time', e.target.value)}
                        />
                    </div>

                    <div className="mt-2 text-xs text-text-muted">
                        В это время вы будете получать уведомления о приближающихся дедлайнах задач (за 2 дня, за 1 день и в день дедлайна).
                    </div>

                    <InputError message={errors.deadline_notification_time} className="mt-2" />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg">
                        <p className="text-sm text-text-secondary">
                            Ваш email не подтвержден.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 text-accent-blue hover:text-accent-green underline focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-2 focus:ring-offset-card-bg rounded"
                            >
                                Нажмите здесь, чтобы отправить письмо подтверждения.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-accent-green">
                                Новое письмо подтверждения отправлено на ваш email.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Сохранение...' : 'Сохранить'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-accent-green flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Сохранено
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
