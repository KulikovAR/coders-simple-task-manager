import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { getSprintStatusOptions } from '@/utils/sprintUtils';

export default function Form({ auth, project, sprint = null, errors = {} }) {
    const isEditing = !!sprint;

    const { data, setData, post, put, processing, errors: formErrors } = useForm({
        name: sprint?.name || '',
        description: sprint?.description || '',
        start_date: sprint?.start_date ? sprint.start_date.split('T')[0] : '',
        end_date: sprint?.end_date ? sprint.end_date.split('T')[0] : '',
        status: sprint?.status || 'planned',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('sprints.update', [project.id, sprint.id]), data);
        } else {
            post(route('sprints.store', project.id), data);
        }
    };

    // Получаем опции для селекта статусов
    const statusOptions = getSprintStatusOptions();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    {isEditing ? 'Редактировать спринт' : 'Новый спринт'}
                </h2>
            }
        >
            <Head title={isEditing ? 'Редактировать спринт' : 'Новый спринт'} />

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Заголовок и действия */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">
                                {isEditing ? 'Редактирование спринта' : 'Создание нового спринта'}
                            </h1>
                            <p className="text-text-secondary">
                                {isEditing ? 'Обновите информацию о спринте' : 'Заполните информацию о новом спринте'}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <a
                                href={route('sprints.index', project.id)}
                                className="btn btn-secondary"
                            >
                                Отмена
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn btn-primary"
                            >
                                {processing ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
                            </button>
                        </div>
                    </div>

                    {/* Основная информация */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Основные поля */}
                            <div className="card">
                                <h3 className="card-title mb-4">Основная информация</h3>
                                <div className="space-y-4">
                                    {/* Название */}
                                    <div>
                                        <label htmlFor="name" className="form-label">
                                            Название спринта *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`form-input ${
                                                formErrors.name ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                            placeholder="Введите название спринта"
                                        />
                                        {formErrors.name && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.name}</p>
                                        )}
                                    </div>

                                    {/* Описание */}
                                    <div>
                                        <label htmlFor="description" className="form-label">
                                            Описание
                                        </label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                            className={`form-input ${
                                                formErrors.description ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                            placeholder="Опишите цели и задачи спринта..."
                                        />
                                        {formErrors.description && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Даты */}
                            <div className="card">
                                <h3 className="card-title mb-4">Период спринта</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Дата начала */}
                                    <div>
                                        <label htmlFor="start_date" className="form-label">
                                            Дата начала *
                                        </label>
                                        <input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className={`form-input ${
                                                formErrors.start_date ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        />
                                        {formErrors.start_date && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.start_date}</p>
                                        )}
                                    </div>

                                    {/* Дата окончания */}
                                    <div>
                                        <label htmlFor="end_date" className="form-label">
                                            Дата окончания *
                                        </label>
                                        <input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className={`form-input ${
                                                formErrors.end_date ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        />
                                        {formErrors.end_date && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.end_date}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Боковая панель */}
                        <div className="space-y-6">
                            {/* Параметры спринта */}
                            <div className="card">
                                <h3 className="card-title mb-4">Параметры спринта</h3>
                                <div className="space-y-4">
                                    {/* Статус */}
                                    <div>
                                        <label htmlFor="status" className="form-label">
                                            Статус
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className={`form-select ${
                                                formErrors.status ? 'border-accent-red focus:ring-accent-red' : ''
                                            }`}
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.icon} {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.status && (
                                            <p className="mt-1 text-sm text-accent-red">{formErrors.status}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Информация */}
                            <div className="card">
                                <h3 className="card-title mb-4">Информация</h3>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <p>• Спринт должен иметь четкие даты начала и окончания</p>
                                    <p>• Статус можно изменить в процессе работы</p>
                                    <p>• После создания спринта можно добавлять задачи</p>
                                </div>
                            </div>

                            {/* Проект */}
                            <div className="card">
                                <h3 className="card-title mb-4">Проект</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Название:</span>
                                        <span className="text-sm text-text-primary font-medium">
                                            {project.name}
                                        </span>
                                    </div>
                                    {project.description && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-muted">Описание:</span>
                                            <span className="text-sm text-text-primary font-medium">
                                                {project.description}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
} 