import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';
import { useState } from 'react';

export default function FileUploadDemo({ auth }) {
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState([]);

    const handleFileUploaded = (files) => {
        console.log('Файлы загружены:', files);
        setAttachments(prev => [...prev, ...files]);
    };

    const handleFileUploadError = (error) => {
        console.error('Ошибка загрузки файла:', error);
        alert('Ошибка загрузки файла: ' + error);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    Демо загрузки файлов
                </h2>
            }
        >
            <Head title="Демо загрузки файлов" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-medium mb-4">
                                Тестирование функционала загрузки файлов
                            </h3>
                            
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Инструкции:
                                </h4>
                                <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                                    <li>• Нажмите на кнопку 📎 (скрепка) в панели инструментов</li>
                                    <li>• Выберите файлы или перетащите их в модальное окно</li>
                                    <li>• Поддерживаются документы, архивы, аудио, видео и изображения до 50MB</li>
                                    <li>• Файлы будут вставлены в редактор как ссылки</li>
                                    <li>• Изображения отображаются как изображения</li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    RichTextEditor с поддержкой файлов
                                </label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    attachableType="App\\Models\\Demo"
                                    attachableId="demo_" + Date.now()}
                                    placeholder="Начните писать... Используйте кнопку 📎 для загрузки файлов"
                                    className="w-full"
                                    onFileUploaded={handleFileUploaded}
                                    onError={handleFileUploadError}
                                />
                            </div>

                            {attachments.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Загруженные файлы ({attachments.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {attachments.map((file, index) => (
                                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">
                                                        {file.mime_type?.startsWith('image/') ? '🖼️' : '📎'}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {file.original_name || file.filename}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : 'Размер неизвестен'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                    HTML контент редактора
                                </h4>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                        {content}
                                    </pre>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Поддерживаемые типы файлов
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div>📄 Документы: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV</div>
                                        <div>📦 Архивы: ZIP, RAR, 7Z</div>
                                        <div>🎵 Аудио: MP3, WAV, OGG, MP4</div>
                                        <div>🎥 Видео: MP4, AVI, MOV, WMV, WebM</div>
                                        <div>🖼️ Изображения: JPG, PNG, GIF, WebP, SVG</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Ограничения
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div>📏 Максимальный размер файла: 50MB</div>
                                        <div>💾 Общий лимит пользователя: 500MB</div>
                                        <div>🔒 Безопасность: CSRF защита, валидация типов</div>
                                        <div>🗂️ Автоматическая организация по типам объектов</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
