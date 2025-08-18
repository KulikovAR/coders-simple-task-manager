import { useState } from 'react';
import RichTextEditor from '@/Components/RichTextEditor';
import TaskContentRenderer from '@/Components/TaskContentRenderer';

export default function RichEditorDemo() {
    const [content, setContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // Демо-пользователи для упоминаний
    const demoUsers = [
        { id: 1, name: 'Александр Куликов', email: 'alex@example.com' },
        { id: 2, name: 'Мария Иванова', email: 'maria@example.com' },
        { id: 3, name: 'Дмитрий Петров', email: 'dmitry@example.com' },
        { id: 4, name: 'Анна Сидорова', email: 'anna@example.com' },
        { id: 5, name: 'Сергей Козлов', email: 'sergey@example.com' },
    ];

    // Отладочная информация о демо-пользователях
    console.log('RichEditorDemo - demoUsers:', demoUsers);

    const handleMentionSelect = (user) => {
        console.log('RichEditorDemo - Упомянут пользователь:', user);
        console.log('RichEditorDemo - User name:', user?.name);
        console.log('RichEditorDemo - User email:', user?.email);
        console.log('RichEditorDemo - User id:', user?.id);
        // Здесь можно добавить логику уведомления
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Заголовок */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Демонстрация RichTextEditor
                    </h1>
                    <p className="text-text-secondary">
                        Умный текстовый редактор с поддержкой форматирования, изображений, ссылок и упоминаний
                    </p>
                </div>

                {/* Основной редактор */}
                <div className="bg-card-bg border border-border-color rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                        Редактор
                    </h2>
                    
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        onMentionSelect={handleMentionSelect}
                        users={demoUsers}
                        placeholder="Начните писать... Попробуйте форматирование, добавьте изображения, ссылки или упомяните пользователей с помощью @"
                        className="w-full"
                    />

                    {/* Кнопки управления */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setContent('')}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Очистить
                            </button>
                            <button
                                onClick={() => setContent('<p>Привет! Это <strong>тестовый</strong> контент с <em>форматированием</em>.</p><p>Попробуйте упомянуть @Александр Куликов или @Мария Иванова</p>')}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Загрузить тест
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            {showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}
                        </button>
                    </div>
                </div>

                {/* Предпросмотр */}
                {showPreview && (
                    <div className="bg-card-bg border border-border-color rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-text-primary mb-4">
                            Предпросмотр
                        </h2>
                        <TaskContentRenderer content={content} />
                    </div>
                )}

                {/* Инструкции */}
                <div className="bg-card-bg border border-border-color rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                        Как использовать
                    </h2>
                    <div className="space-y-3 text-text-secondary">
                        <div>
                            <h3 className="font-medium text-text-primary">Форматирование текста:</h3>
                            <p>Используйте кнопки на панели инструментов для <strong>жирного</strong>, <em>курсивного</em> текста, списков и цитат.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-text-primary">Упоминания пользователей:</h3>
                            <p>Введите символ @ и начните печатать имя пользователя. Выберите нужного пользователя из списка.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-text-primary">Добавление ссылок:</h3>
                            <p>Нажмите на кнопку ссылки и введите URL.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-text-primary">Добавление изображений:</h3>
                            <p>Нажмите на кнопку изображения и введите URL или перетащите файл в редактор.</p>
                        </div>
                    </div>
                </div>

                {/* Тестовые данные */}
                <div className="bg-card-bg border border-border-color rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                        Тестовые пользователи для упоминаний
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {demoUsers.map(user => (
                            <div key={user.id} className="p-3 border border-border-color rounded-lg">
                                <div className="font-medium text-text-primary">{user.name}</div>
                                <div className="text-sm text-text-muted">{user.email}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
