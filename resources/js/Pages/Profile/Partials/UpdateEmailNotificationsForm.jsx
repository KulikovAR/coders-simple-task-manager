import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function UpdateEmailNotificationsForm({ className = '', user }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        email_notifications: user?.email_notifications ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
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

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        Сохранить
                    </PrimaryButton>

                    {recentlySuccessful && (
                        <span className="text-sm text-accent-green">
                            Сохранено.
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
} 