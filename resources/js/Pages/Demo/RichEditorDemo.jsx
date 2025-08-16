import { useState } from 'react';
import RichTextEditor from '@/Components/RichTextEditor';
import HtmlRenderer from '@/Components/HtmlRenderer';

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

    const handleMentionSelect = (user) => {
        console.log('Упомянут пользователь:', user);
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
                        <div className="text-sm text-text-muted">
                            {content.length > 0 ? `${content.length} символов` : 'Пустой редактор'}
                        </div>
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setContent('')}
                                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Очистить
                            </button>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="px-4 py-2 text-sm bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors"
                            >
                                {showPreview ? 'Скрыть' : 'Показать'} предпросмотр
                            </button>
                        </div>
                    </div>
                </div>

                {/* Предпросмотр */}
                {showPreview && (
                    <div className="bg-card-bg border border-border-color rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-text-primary mb-4">
                            Предпросмотр
                        </h2>
                        
                        {content ? (
                            <div className="prose prose-sm max-w-none">
                                <HtmlRenderer content={content} />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-text-muted">
                                <p>Начните писать в редакторе, чтобы увидеть предпросмотр</p>
                            </div>
                        )}
                    </div>
                )}

                {/* HTML код */}
                {content && (
                    <div className="bg-card-bg border border-border-color rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-text-primary mb-4">
                            HTML код
                        </h2>
                        
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm">
                                <code>{content}</code>
                            </pre>
                        </div>
                    </div>
                )}

                {/* Инструкции */}
                <div className="bg-card-bg border border-border-color rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                        Как использовать
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-text-primary mb-2">Форматирование</h3>
                            <ul className="text-sm text-text-secondary space-y-1">
                                <li>• <strong>Жирный</strong> - кнопка B или Ctrl+B</li>
                                <li>• <em>Курсив</em> - кнопка I или Ctrl+I</li>
                                <li>• <code>Код</code> - кнопка &lt;/&gt; или Ctrl+Shift+C</li>
                                <li>• Цитаты - кнопка " в панели инструментов</li>
                                <li>• Списки - кнопки маркированного и нумерованного списка</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-text-primary mb-2">Медиа и ссылки</h3>
                            <ul className="text-sm text-text-secondary space-y-1">
                                <li>• Ссылки - кнопка 🔗 в панели инструментов</li>
                                <li>• Изображения - кнопка 🖼️ или перетащите файл</li>
                                <li>• Файлы - кнопка 📎 для загрузки</li>
                                <li>• Drag & Drop - перетащите изображение в редактор</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-text-primary mb-2">Упоминания</h3>
                            <ul className="text-sm text-text-secondary space-y-1">
                                <li>• Начните писать @ для упоминания пользователей</li>
                                <li>• Используйте стрелки для навигации</li>
                                <li>• Enter или Tab для выбора</li>
                                <li>• Escape для закрытия списка</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-text-primary mb-2">Горячие клавиши</h3>
                            <ul className="text-sm text-text-secondary space-y-1">
                                <li>• Ctrl+Z - отменить</li>
                                <li>• Ctrl+Y - повторить</li>
                                <li>• Ctrl+B - жирный</li>
                                <li>• Ctrl+I - курсив</li>
                                <li>• Ctrl+Shift+C - код</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Демо-контент */}
                <div className="bg-card-bg border border-border-color rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                        Попробуйте готовый контент
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setContent(`
                                <h2>Привет, мир! 👋</h2>
                                <p>Это <strong>демонстрация</strong> возможностей <em>RichTextEditor</em>.</p>
                                <p>Вы можете:</p>
                                <ul>
                                    <li>Форматировать <strong>текст</strong></li>
                                    <li>Добавлять <em>списки</em></li>
                                    <li>Вставлять <a href="https://example.com">ссылки</a></li>
                                    <li>Упоминать пользователей с помощью @</li>
                                </ul>
                                <blockquote>
                                    <p>Это цитата для демонстрации блочного цитирования.</p>
                                </blockquote>
                                <p>Также поддерживается <code>код</code> и другие элементы.</p>
                            `)}
                            className="p-3 text-left bg-secondary-bg border border-border-color rounded hover:bg-accent-blue/10 transition-colors"
                        >
                            <div className="font-semibold text-text-primary">Базовое форматирование</div>
                            <div className="text-sm text-text-muted mt-1">
                                Заголовки, жирный текст, курсив, списки, цитаты
                            </div>
                        </button>
                        
                        <button
                            onClick={() => setContent(`
                                <h3>Задача: Разработка веб-приложения</h3>
                                <p><strong>Статус:</strong> <span style="color: #10b981;">В работе</span></p>
                                <p><strong>Приоритет:</strong> <span style="color: #ef4444;">Высокий</span></p>
                                <p><strong>Описание:</strong></p>
                                <p>Необходимо создать современное веб-приложение для управления задачами с использованием:</p>
                                <ul>
                                    <li>React + TypeScript</li>
                                    <li>Tailwind CSS</li>
                                    <li>Laravel на бэкенде</li>
                                    <li>MySQL база данных</li>
                                </ul>
                                <p><strong>Команда:</strong></p>
                                <p>@Александр Куликов - фронтенд разработчик<br>
                                @Мария Иванова - бэкенд разработчик<br>
                                @Дмитрий Петров - дизайнер</p>
                                <p><strong>Дедлайн:</strong> 15 декабря 2024</p>
                            `)}
                            className="p-3 text-left bg-secondary-bg border border-border-color rounded hover:bg-accent-blue/10 transition-colors"
                        >
                            <div className="font-semibold text-text-primary">Описание задачи</div>
                            <div className="text-sm text-text-muted mt-1">
                                Структурированное описание с упоминаниями и форматированием
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
