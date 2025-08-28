import { useState, useEffect } from 'react';
import FileRenderer from '@/Components/FileRenderer';
import { Paperclip, Download, Trash2 } from 'lucide-react';

export default function FileAttachments({ commentId, onFileDeleted }) {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (commentId) {
            loadAttachments();
        }
    }, [commentId]);

    const loadAttachments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/file-upload?attachable_type=App\\Models\\TaskComment&attachable_id=${commentId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки файлов');
            }

            const result = await response.json();
            
            if (result.success) {
                setAttachments(result.data.attachments || []);
            } else {
                setError(result.message || 'Ошибка загрузки файлов');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileDelete = async (fileId) => {
        try {
            const response = await fetch(`/api/file-upload/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Ошибка удаления файла');
            }

            const result = await response.json();
            
            if (result.success) {
                // Удаляем файл из локального состояния
                setAttachments(prev => prev.filter(file => file.id !== fileId));
                
                // Уведомляем родительский компонент
                onFileDeleted?.(fileId);
            } else {
                throw new Error(result.message || 'Ошибка удаления файла');
            }
        } catch (err) {
            console.error('Ошибка при удалении файла:', err);
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-sm py-2">
                Ошибка загрузки файлов: {error}
            </div>
        );
    }

    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
                <Paperclip size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Вложения ({attachments.length})
                </span>
            </div>
            
            <div className="space-y-3">
                {attachments.map((attachment) => (
                    <div 
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">
                                {attachment.file_icon || '📎'}
                            </span>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {attachment.original_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {attachment.formatted_size || '0 Б'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <a
                                href={attachment.download_url || `/api/file-upload/${attachment.id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Скачать файл"
                            >
                                <Download size={16} />
                            </a>
                            
                            <button
                                onClick={() => handleFileDelete(attachment.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Удалить файл"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
