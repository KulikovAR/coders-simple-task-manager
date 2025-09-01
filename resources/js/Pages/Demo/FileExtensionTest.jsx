import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FileExtension from '@/Components/RichTextEditor/FileExtension';
import { useState } from 'react';

export default function FileExtensionTest({ auth }) {
    const [content, setContent] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            FileExtension,
        ],
        content: '<p>Тест FileExtension</p>',
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    const insertTestFile = () => {
        if (!editor) return;

        try {
            const result = editor.chain().focus().setFileAttachment({
                id: 'test-123',
                filename: 'test-document.pdf',
                size: 1024 * 1024, // 1MB
                mimeType: 'application/pdf',
                url: '/test-download',
                description: 'Тестовый PDF документ'
            }).run();

        } catch (error) {
            console.error('Ошибка при вставке файла:', error);
        }
    };

    if (!editor) {
        return <div>Загрузка редактора...</div>;
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    Тест FileExtension
                </h2>
            }
        >
            <Head title="Тест FileExtension" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-medium mb-4">
                                Тестирование FileExtension
                            </h3>

                            <div className="mb-6">
                                <button
                                    onClick={insertTestFile}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Вставить тестовый файл
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Редактор
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 min-h-[200px]">
                                    <EditorContent editor={editor} />
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                    HTML контент
                                </h4>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                        {content}
                                    </pre>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                    JSON контент
                                </h4>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                        {JSON.stringify(editor.getJSON(), null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
