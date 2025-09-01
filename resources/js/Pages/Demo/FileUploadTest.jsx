import React, { useState } from 'react';
import RichTextEditor from '../../Components/RichTextEditor';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function FileUploadTest() {
    const [content, setContent] = useState('');
    const [savedContent, setSavedContent] = useState('');

    const handleChange = (newContent) => {
        setContent(newContent);
    };

    const handleSave = () => {
        setSavedContent(content);
    };

    const handleLoad = () => {
        setContent(savedContent);
    };

    return (
        <AuthenticatedLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-6">Тест загрузки файлов в RichTextEditor</h1>

                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Инструкции:</h2>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                    <li>Вставьте файл в редактор (кнопка 📎)</li>
                                    <li>Нажмите "Сохранить" для сохранения контента</li>
                                    <li>Очистите редактор</li>
                                    <li>Нажмите "Загрузить" для восстановления контента</li>
                                    <li>Проверьте, что файл восстановился как интерактивный блок</li>
                                </ol>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Редактор:</h2>
                                <RichTextEditor
                                    value={content}
                                    onChange={handleChange}
                                    placeholder="Начните писать или вставьте файл..."
                                    attachableType="App\\Models\\Demo"
                                    attachableId="test_123"
                                />
                            </div>

                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={handleLoad}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Загрузить
                                </button>
                                <button
                                    onClick={() => setContent('')}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Очистить
                                </button>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">HTML контент:</h2>
                                <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
                                    <pre>{content}</pre>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Сохраненный контент:</h2>
                                <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
                                    <pre>{savedContent}</pre>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-2">Отображение сохраненного контента:</h2>
                                <div className="border p-4 rounded">
                                    <div dangerouslySetInnerHTML={{ __html: savedContent }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
