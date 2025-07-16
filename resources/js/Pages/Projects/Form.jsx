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
                <h2 className="font-semibold text-xl text-green-400 leading-tight">
                    {isEditing ? 'Редактировать проект' : 'Новый проект'}
                </h2>
            }
        >
            <Head title={isEditing ? 'Редактировать проект' : 'Новый проект'} />

            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Название */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                                Название проекта *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-500 ${
                                    formErrors.name ? 'border-red-500' : 'border-gray-700'
                                }`}
                                placeholder="Введите название проекта"
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
                            )}
                        </div>

                        {/* Описание */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
                                Описание
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-500 ${
                                    formErrors.description ? 'border-red-500' : 'border-gray-700'
                                }`}
                                placeholder="Опишите проект..."
                            />
                            {formErrors.description && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.description}</p>
                            )}
                        </div>

                        {/* Статус */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-2">
                                Статус
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-green-400 focus:outline-none focus:border-green-500 ${
                                    formErrors.status ? 'border-red-500' : 'border-gray-700'
                                }`}
                            >
                                <option value="active">Активный</option>
                                <option value="completed">Завершен</option>
                                <option value="on_hold">Приостановлен</option>
                                <option value="cancelled">Отменен</option>
                            </select>
                            {formErrors.status && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.status}</p>
                            )}
                        </div>

                        {/* Дедлайн */}
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-400 mb-2">
                                Дедлайн
                            </label>
                            <input
                                id="deadline"
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-green-400 focus:outline-none focus:border-green-500 ${
                                    formErrors.deadline ? 'border-red-500' : 'border-gray-700'
                                }`}
                            />
                            {formErrors.deadline && (
                                <p className="mt-1 text-sm text-red-400">{formErrors.deadline}</p>
                            )}
                        </div>

                        {/* Документы */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
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
                                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-500"
                                        />
                                        {docs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDoc(index)}
                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
                                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                                >
                                    + Добавить документ
                                </button>
                            </div>
                        </div>

                        {/* Кнопки */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
                            <a
                                href={route('projects.index')}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Отмена
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
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