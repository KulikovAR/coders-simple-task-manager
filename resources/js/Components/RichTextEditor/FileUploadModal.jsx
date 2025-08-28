import { useState, useRef, useEffect } from 'react';
import RichTextFileService from './RichTextFileService';
import { X, Upload, File, AlertCircle, CheckCircle } from 'lucide-react';

export default function FileUploadModal({ 
    isOpen, 
    onClose, 
    onFileUploaded, 
    attachableType, 
    attachableId,
    onError 
}) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadResults, setUploadResults] = useState([]);
    const [showStats, setShowStats] = useState(false);
    const [userStats, setUserStats] = useState(null);
    
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);
    const fileService = new RichTextFileService();

    useEffect(() => {
        if (isOpen) {
            loadUserStats();
        }
    }, [isOpen]);

    const loadUserStats = async () => {
        const stats = await fileService.getUserFileStats();
        setUserStats(stats);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    // Предотвращаем обновление страницы при drag & drop
    useEffect(() => {
        const preventDefault = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Предотвращаем drag & drop на уровне документа
        document.addEventListener('dragover', preventDefault);
        document.addEventListener('drop', preventDefault);

        return () => {
            document.removeEventListener('dragover', preventDefault);
            document.removeEventListener('drop', preventDefault);
        };
    }, []);

    const handleFiles = (files) => {
        const validFiles = files.filter(file => {
            const validation = fileService.canUploadFile(file);
            if (!validation.canUpload) {
                onError?.(validation.error);
            }
            return validation.canUpload;
        });

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadResults([]);

        const results = [];
        const totalFiles = selectedFiles.length;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const progress = ((i + 1) / totalFiles) * 100;
            setUploadProgress(progress);

            try {
                const result = await fileService.uploadFile(
                    file, 
                    attachableType, 
                    attachableId,
                    `Загружен через RichTextEditor`
                );

                if (result.success) {
                    results.push({
                        success: true,
                        file: result.file,
                        originalFile: file
                    });
                } else {
                    results.push({
                        success: false,
                        error: result.error,
                        originalFile: file
                    });
                }
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    originalFile: file
                });
            }

            setUploadResults([...results]);
        }

        setUploading(false);
        setUploadProgress(100);

        // Уведомляем родительский компонент об успешных загрузках
        const successfulUploads = results.filter(r => r.success);
        if (successfulUploads.length > 0) {
            const files = successfulUploads.map(r => r.file).filter(Boolean);
            console.log('FileUploadModal: Отправляем файлы в onFileUploaded:', files);
            onFileUploaded?.(files);
        }

        // Обновляем статистику
        await loadUserStats();
    };

    const closeModal = () => {
        if (!uploading) {
            setSelectedFiles([]);
            setUploadResults([]);
            setUploadProgress(0);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Затемнение фона */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={closeModal}
            />

            {/* Модальное окно */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                    {/* Заголовок */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Загрузка файлов
                        </h2>
                        <button
                            onClick={closeModal}
                            disabled={uploading}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Статистика пользователя */}
                    {userStats && (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">
                                    Использовано: {userStats.total_size_formatted} / {userStats.max_size_formatted}
                                </span>
                                <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${userStats.used_percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Область загрузки - скроллится */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Drag & Drop область */}
                        <div
                            ref={dropRef}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                dragActive 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            <Upload 
                                size={48} 
                                className={`mx-auto mb-4 ${
                                    dragActive ? 'text-blue-500' : 'text-gray-400'
                                }`}
                            />
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Перетащите файлы сюда или кликните для выбора
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Поддерживаются документы, архивы, аудио, видео и изображения до 50MB
                            </p>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Выбрать файлы
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.mp3,.wav,.ogg,.mp4,.avi,.mov,.wmv,.webm,.jpg,.jpeg,.png,.gif,.webp,.svg"
                            />
                        </div>

                        {/* Выбранные файлы */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Выбранные файлы ({selectedFiles.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedFiles.map((file, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <File size={20} className="text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {fileService.formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                disabled={uploading}
                                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Результаты загрузки */}
                        {uploadResults.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Результаты загрузки
                                </h3>
                                <div className="space-y-3">
                                    {uploadResults.map((result, index) => (
                                        <div 
                                            key={index}
                                            className={`flex items-center space-x-3 p-3 rounded-lg ${
                                                result.success 
                                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                            }`}
                                        >
                                            {result.success ? (
                                                <CheckCircle size={20} className="text-green-500" />
                                            ) : (
                                                <AlertCircle size={20} className="text-red-500" />
                                            )}
                                            <div className="flex-1">
                                                <p className={`font-medium ${
                                                    result.success 
                                                        ? 'text-green-900 dark:text-green-100' 
                                                        : 'text-red-900 dark:text-red-100'
                                                }`}>
                                                    {result.success ? result.file.original_name : result.originalFile.name}
                                                </p>
                                                {!result.success && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {result.error}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Прогресс загрузки */}
                        {uploading && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Загрузка файлов...
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {Math.round(uploadProgress)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Кнопки - всегда видны */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <button
                            onClick={closeModal}
                            disabled={uploading}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={uploadFiles}
                            disabled={selectedFiles.length === 0 || uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {uploading ? 'Загрузка...' : `Загрузить ${selectedFiles.length} файл(ов)`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
