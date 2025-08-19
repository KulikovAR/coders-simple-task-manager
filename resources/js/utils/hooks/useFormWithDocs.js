import { useState } from 'react';
import { useForm } from '@inertiajs/react';

/**
 * Хук для работы с формами, содержащими документацию
 * @param {Object} initialData - начальные данные формы
 * @param {Object} options - опции формы
 * @returns {Object} - состояние и методы для работы с формой
 */
export function useFormWithDocs(initialData = {}, options = {}) {
    const {
        docs: initialDocs = [''],
        isEditing = false,
    } = options;

    const [docs, setDocs] = useState(() => {
        if (initialDocs && Array.isArray(initialDocs) && initialDocs.length > 0) {
            return initialDocs.map(doc => typeof doc === 'string' ? doc : '');
        }
        return [''];
    });

    const [showTips, setShowTips] = useState(!isEditing);

    const form = useForm({
        ...initialData,
        docs: docs,
    });

    const addDoc = () => {
        const newDocs = [...docs, ''];
        setDocs(newDocs);
        form.setData('docs', newDocs);
    };

    const removeDoc = (index) => {
        const newDocs = docs.filter((_, i) => i !== index);
        setDocs(newDocs);
        form.setData('docs', newDocs);
    };

    const updateDoc = (index, value) => {
        const newDocs = [...docs];
        newDocs[index] = value;
        setDocs(newDocs);
        form.setData('docs', newDocs);
    };

    const handleSubmit = (e, submitCallback) => {
        e.preventDefault();
        
        const formData = {
            ...form.data,
            docs: docs.filter(doc => typeof doc === 'string' && doc.trim() !== ''),
        };

        // Проверяем обязательные поля
        if (!formData.name) {
            form.setError('name', 'Название проекта обязательно для заполнения');
            return;
        }

        if (!formData.status) {
            formData.status = 'active'; // Устанавливаем значение по умолчанию
        }

        submitCallback(formData);
    };

    return {
        form,
        docs,
        showTips,
        setShowTips,
        addDoc,
        removeDoc,
        updateDoc,
        handleSubmit,
    };
}
