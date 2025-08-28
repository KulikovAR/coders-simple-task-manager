import { useState } from 'react';
import { Download, Trash2, File, Image, Video, Music, Archive, FileText } from 'lucide-react';

export default function FileRenderer({ file, onDelete, showDeleteButton = false }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const getFileIcon = (mimeType) => {
        if (!mimeType) return <File size={20} />;
        
        if (mimeType.startsWith('image/')) return <Image size={20} />;
        if (mimeType.startsWith('video/')) return <Video size={20} />;
        if (mimeType.startsWith('audio/')) return <Music size={20} />;
        if (mimeType.includes('pdf')) return <FileText size={20} />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText size={20} />;
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText size={20} />;
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <FileText size={20} />;
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return <Archive size={20} />;
        if (mimeType.includes('text/')) return <FileText size={20} />;
        
        return <File size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        if (bytes === 0) return '0 Б';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDelete = async () => {
        if (!onDelete || isDeleting) return;
        
        setIsDeleting(true);
        try {
            await onDelete(file.id);
        } catch (error) {
            console.error('Ошибка при удалении файла:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const isImage = file.mimeType && file.mimeType.startsWith('image/');
    const isVideo = file.mimeType && file.mimeType.startsWith('video/');
    const isAudio = file.mimeType && file.mimeType.startsWith('audio/');

    return (
        <div className="file-attachment-node my-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="file-attachment-content">
                {/* Заголовок файла */}
                <div className="file-attachment-header flex items-center gap-3 mb-2">
                    <span className="file-attachment-icon text-gray-600 dark:text-gray-400">
                        {getFileIcon(file.mimeType)}
                    </span>
                    <span className="file-attachment-filename font-medium text-gray-900 dark:text-white">
                        {file.filename || 'Файл'}
                    </span>
                </div>

                {/* Детали файла */}
                <div className="file-attachment-details flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="file-attachment-size">
                        {formatFileSize(file.size)}
                    </span>
                    {file.description && (
                        <span className="file-attachment-description">
                            {file.description}
                        </span>
                    )}
                </div>

                {/* Предпросмотр для изображений */}
                {isImage && file.url && (
                    <div className="file-attachment-preview mb-3">
                        <img 
                            src={file.url} 
                            alt={file.filename || 'Изображение'}
                            className="max-w-full h-auto max-h-64 rounded border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Предпросмотр для видео */}
                {isVideo && file.url && (
                    <div className="file-attachment-preview mb-3">
                        <video 
                            controls 
                            className="max-w-full h-auto max-h-64 rounded border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        >
                            <source src={file.url} type={file.mimeType} />
                            Ваш браузер не поддерживает видео.
                        </video>
                    </div>
                )}

                {/* Предпросмотр для аудио */}
                {isAudio && file.url && (
                    <div className="file-attachment-preview mb-3">
                        <audio 
                            controls 
                            className="w-full"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        >
                            <source src={file.url} type={file.mimeType} />
                            Ваш браузер не поддерживает аудио.
                        </audio>
                    </div>
                )}

                {/* Кнопки действий */}
                <div className="file-attachment-actions flex items-center gap-2">
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-attachment-link inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <Download size={16} />
                        Скачать
                    </a>
                    
                    {showDeleteButton && onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {isDeleting ? 'Удаление...' : 'Удалить'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
