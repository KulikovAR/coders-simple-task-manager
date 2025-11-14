import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useFormWithDocs } from '@/utils/hooks/useFormWithDocs';
import RichTextEditor from '@/Components/RichTextEditor';

export default function Form({ auth, project = null, errors = {} }) {
    const isEditing = !!project;

    const {
        form: { data, setData, post, put, processing, errors: formErrors },
        docs,
        showTips,
        setShowTips,
        addDoc,
        removeDoc,
        updateDoc,
        handleSubmit,
    } = useFormWithDocs(
        {
            name: project?.name || '',
            description: project?.description || '',
            status: project?.status || 'active',
            deadline: project?.deadline ? project.deadline.split('T')[0] : '',
        },
        {
            docs: project?.docs || [''],
            isEditing,
        }
    );

    const onSubmit = (e) => {
        handleSubmit(e, (formData) => {
            if (isEditing) {
                put(route('projects.update', project.id), formData, {
                    onError: (errors) => {
                        console.error('Ошибка при обновлении проекта:', errors);
                    }
                });
            } else {
                post(route('projects.store'), formData, {
                    onError: (errors) => {
                        console.error('Ошибка при создании проекта:', errors);
                    }
                });
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-accent-green';
            case 'completed': return 'text-accent-blue';
            case 'on_hold': return 'text-accent-yellow';
            case 'cancelled': return 'text-accent-red';
            default: return 'text-text-secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return '🚀';
            case 'completed': return '✅';
            case 'on_hold': return '⏸️';
            case 'cancelled': return '❌';
            default: return '📋';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    {isEditing ? 'Редактировать проект' : 'Новый проект'}
                </h2>
            }
        >
            <Head title={isEditing ? 'Редактировать проект' : 'Новый проект'} />

            {/* Стили для иконки календаря в темной теме */}
            <style jsx>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(0);
                }
                .dark input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                }
                @media (prefers-color-scheme: dark) {
                    input[type="date"]::-webkit-calendar-picker-indicator {
                        filter: invert(1);
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Основная форма */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <form onSubmit={onSubmit} className="space-y-6">
                                {/* Название */}
                                <div>
                                    <label htmlFor="name" className="form-label">
                                        Название проекта *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`form-input ${
                                            formErrors.name ? 'border-accent-red focus:ring-accent-red' : ''
                                        }`}
                                        placeholder="Введите название проекта"
                                        maxLength={255}
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        {formErrors.name && (
                                            <p className="text-sm text-accent-red">{formErrors.name}</p>
                                        )}
                                        <p className="text-xs text-text-muted ml-auto">
                                            {data.name.length}/255
                                        </p>
                                    </div>
                                </div>

                                {/* Описание */}
                                <div>
                                    <label htmlFor="description" className="form-label">
                                        Описание
                                    </label>
                                    <RichTextEditor
                                        value={data.description}
                                        onChange={(value) => setData('description', value)}
                                        attachableType="App\\Models\\Project"
                                        attachableId={project?.id || 'temp_' + Date.now()}
                                        placeholder="Опишите цели проекта, основные задачи и ожидаемые результаты... (поддерживается форматирование, изображения, ссылки и загрузка файлов)"
                                        className="w-full"
                                    />
                                    {formErrors.description && (
                                        <p className="mt-1 text-sm text-accent-red">{formErrors.description}</p>
                                    )}
                                </div>

                                {/* Статус и дедлайн */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="status" className="form-label">
                                            Статус проекта
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className={`form-select ${
                                                formErrors.status ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        >
                                            <option value="active">🚀 Активный</option>
                                            <option value="completed">✅ Завершен</option>
                                            <option value="on_hold">⏸️ Приостановлен</option>
                                            <option value="cancelled">❌ Отменен</option>
                                        </select>
                                        {formErrors.status && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="deadline" className="form-label">
                                            Дедлайн проекта
                                        </label>
                                        <input
                                            id="deadline"
                                            type="date"
                                            value={data.deadline}
                                            onChange={(e) => setData('deadline', e.target.value)}
                                            className={`form-input ${
                                                formErrors.deadline ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        />
                                        {formErrors.deadline && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.deadline}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Документы */}
                                <div>
                                    <label className="form-label">
                                        Ссылки на документы
                                    </label>
                                    <div className="space-y-2">
                                        {docs.map((doc, index) => (
                                            <div key={index} className="flex space-x-2">
                                                <input
                                                    type="url"
                                                    value={doc}
                                                    onChange={(e) => updateDoc(index, e.target.value)}
                                                    placeholder="https://docs.google.com/..."
                                                    className="flex-1 form-input"
                                                />
                                                {docs.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDoc(index)}
                                                        className="btn btn-danger btn-sm"
                                                        title="Удалить документ"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addDoc}
                                            className="text-accent-blue hover:text-blue-300 text-sm font-medium transition-colors inline-flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Добавить документ
                                        </button>
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">
                                        Добавьте ссылки на технические документы, спецификации или другие материалы проекта
                                    </p>
                                </div>

                                {/* Кнопки */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-border-color">
                                    <a
                                        href={route('projects.index')}
                                        className="btn btn-secondary"
                                    >
                                        Отмена
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn btn-success text-white"
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Сохранение...
                                            </div>
                                        ) : (
                                            isEditing ? 'Обновить проект' : 'Создать проект'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-6">
                        {/* Подсказки */}
                        {showTips && (
                            <div className="card bg-gradient-to-r from-accent-blue/10 to-accent-green/10 border-accent-blue/20">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-medium text-text-primary flex items-center">
                                        💡 Полезные советы
                                    </h3>
                                    <button
                                        onClick={() => setShowTips(false)}
                                        className="text-text-muted hover:text-text-secondary transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <p>• <strong>Название</strong> должно быть кратким и понятным</p>
                                    <p>• <strong>Описание</strong> поможет команде понять цели проекта</p>
                                    <p>• <strong>Дедлайн</strong> поможет планировать работу</p>
                                    <p>• <strong>Документы</strong> можно добавить позже</p>
                                </div>
                            </div>
                        )}

                        {/* Информация */}
                        <div className="card">
                            <h3 className="card-title mb-4">Информация</h3>
                            <div className="space-y-2 text-sm text-text-secondary">
                                <p>• После создания проекта можно добавлять участников</p>
                                <p>• Создавайте спринты для планирования работы</p>
                                <p>• Используйте доску для визуального управления</p>
                                <p>• Добавляйте задачи и отслеживайте прогресс</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
