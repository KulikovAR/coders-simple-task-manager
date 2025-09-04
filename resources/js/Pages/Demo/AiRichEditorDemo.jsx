import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';
import { useState } from 'react';

export default function AiRichEditorDemo({ auth }) {
    const [content, setContent] = useState(`
        <p>Привет! Это тестовый текст для демонстрации ИИ оптимизации.</p>
        <p>Здесь есть несколько грамматических ошибок и не очень хороший стиль написания.</p>
        <p>Попробуйте выделить этот текст и нажать кнопку "ИИ" чтобы увидеть как работает искусственный интеллект!</p>
        <p>ИИ может добавить HTML форматирование: списки, выделение важного текста, подзаголовки и многое другое.</p>
    `);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Демо ИИ RichTextEditor</h2>}
        >
            <Head title="Демо ИИ RichTextEditor" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">ИИ Оптимизация текста</h3>
                                <p className="text-gray-600 mb-4">
                                    Напишите или вставьте текст в редактор ниже, выделите нужный фрагмент текста, затем нажмите кнопку 
                                    <span className="inline-flex items-center gap-1 px-2 py-1 mx-1 bg-purple-100 text-purple-700 rounded text-sm">
                                        ✨ ИИ
                                    </span>
                                    чтобы оптимизировать только выделенный текст с помощью искусственного интеллекта.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-blue-900 mb-2">Возможности ИИ оптимизации:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Исправление грамматических ошибок и опечаток</li>
                                        <li>• Улучшение стиля написания</li>
                                        <li>• Повышение читаемости и структурированности текста</li>
                                        <li>• Добавление HTML форматирования (списки, выделение, подзаголовки)</li>
                                        <li>• Сохранение файловых вложений и форматирования</li>
                                        <li>• Работа только с выделенным текстом</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        RichTextEditor с ИИ оптимизацией:
                                    </label>
                                    <RichTextEditor
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Начните писать текст для оптимизации..."
                                        className="min-h-[200px]"
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">HTML результат:</h4>
                                    <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-40">
                                        {content}
                                    </pre>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Текстовое содержимое (без HTML):</h4>
                                    <div className="text-sm text-gray-600 bg-white p-3 rounded border max-h-40 overflow-auto">
                                        {content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || 'Пустой текст'}
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
