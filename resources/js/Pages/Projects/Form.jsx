import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Form({ auth, project = null, errors = {} }) {
    const isEditing = !!project;
    const [docs, setDocs] = useState(project?.docs || ['']);

    const { data, setData, post, put, processing, errors: formErrors } = useForm({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'active',
        deadline: project?.deadline ? project.deadline.split('T')[0] : '',
        docs: project?.docs || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            docs: docs.filter(doc => doc.trim() !== ''),
        };

        if (isEditing) {
            put(route('projects.update', project.id), formData);
        } else {
            post(route('projects.store'), formData);
        }
    };

    const addDoc = () => {
        setDocs([...docs, '']);
    };

    const removeDoc = (index) => {
        setDocs(docs.filter((_, i) => i !== index));
    };

    const updateDoc = (index, value) => {
        const newDocs = [...docs];
        newDocs[index] = value;
        setDocs(newDocs);
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

            <div className="max-w-2xl mx-auto">
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                placeholder="Опишите проект..."
                            />
                            {formErrors.description && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.description}</p>
                            )}
                        </div>

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
                                <option value="active">Активный</option>
                                <option value="completed">Завершен</option>
                                <option value="on_hold">Приостановлен</option>
                                <option value="cancelled">Отменен</option>
                            </select>
                            {formErrors.status && (
                                <p className="mt-1 text-sm text-accent-red">{formErrors.status}</p>
                            )}
                        </div>

                        {/* Дедлайн */}
                        <div>
                            <label htmlFor="deadline" className="form-label">
                                Дедлайн
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
                                                className="btn btn-danger"
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
                                    className="text-accent-blue hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    + Добавить документ
                                </button>
                            </div>
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
                                className="btn btn-success"
                            >
                                {processing ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 