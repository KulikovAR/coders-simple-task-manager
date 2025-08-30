import { useState, useRef, useEffect } from 'react';
import RichTextFileService from './RichTextFileService';
import { X, Upload, File, AlertCircle, CheckCircle, HardDrive, Cloud, Zap, Eye, Trash2 } from 'lucide-react';

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
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    
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
        setPreviewFile(null);
    };

    const previewFileHandler = (file) => {
        if (file.type.startsWith('image/')) {
            setPreviewFile(file);
        }
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
                    ''
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
            console.log(`FileUploadModal: Успешно загружено ${files.length} файлов`);
            
            // Показываем уведомление об успехе
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            
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
            setPreviewFile(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Затемнение фона с анимацией */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
                onClick={closeModal}
            />

            {/* Модальное окно с анимацией */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
                    {/* Заголовок с градиентом */}
                    <div className="relative overflow-hidden rounded-t-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-10"></div>
                        <div className="relative flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                                    <Upload size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Загрузка файлов
                                    </h2>
                                    {selectedFiles.length > 0 && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Выбрано {selectedFiles.length} файл{selectedFiles.length === 1 ? '' : selectedFiles.length < 5 ? 'а' : 'ов'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                disabled={uploading}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Статистика пользователя с улучшенным дизайном */}
                    {userStats && (
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <HardDrive size={20} className="text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Использовано: {userStats.total_size_formatted} / {userStats.max_size_formatted}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-40 bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${userStats.used_percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                                        {userStats.used_percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Уведомление об успешной загрузке с анимацией */}
                    {showSuccessMessage && (
                        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-700/50 flex-shrink-0">
                            <div className="flex items-center text-sm text-green-700 dark:text-green-300">
                                <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-full mr-3">
                                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium">Файлы успешно загружены и вставлены в редактор!</span>
                            </div>
                        </div>
                    )}

                    {/* Область загрузки - скроллится */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Drag & Drop область с улучшенным дизайном */}
                        <div
                            ref={dropRef}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                                dragActive 
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 scale-105 shadow-lg' 
                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            {/* Анимированный фон */}
                            {dragActive && (
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse rounded-2xl"></div>
                            )}
                            
                            <div className="relative z-10">
                                <div className={`inline-flex p-4 rounded-2xl mb-6 transition-all duration-300 ${
                                    dragActive 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                    <Upload 
                                        size={56} 
                                        className={`transition-all duration-300 ${
                                            dragActive ? 'animate-bounce' : ''
                                        }`}
                                    />
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {dragActive ? 'Отпустите файлы здесь!' : 'Перетащите файлы сюда'}
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                    Поддерживаются документы, архивы, аудио, видео и изображения до 50MB
                                </p>
                                
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium text-lg"
                                >
                                    <Cloud className="inline mr-2" size={20} />
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
                        </div>

                        {/* Выбранные файлы с улучшенным дизайном */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <File size={24} className="text-blue-500" />
                                    Выбранные файлы ({selectedFiles.length})
                                </h3>
                                <div className="grid gap-4">
                                    {selectedFiles.map((file, index) => (
                                        <div 
                                            key={index}
                                            className="group relative p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl">
                                                        <File size={24} className="text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {fileService.formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {file.type.startsWith('image/') && (
                                                        <button
                                                            onClick={() => previewFileHandler(file)}
                                                            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200"
                                                            title="Предпросмотр"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        disabled={uploading}
                                                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Результаты загрузки с улучшенным дизайном */}
                        {uploadResults.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Zap size={24} className="text-yellow-500" />
                                    Результаты загрузки
                                </h3>
                                <div className="space-y-3">
                                    {uploadResults.map((result, index) => (
                                        <div 
                                            key={index}
                                            className={`p-4 rounded-xl border transition-all duration-300 ${
                                                result.success 
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {result.success ? (
                                                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                                                )}
                                                <div className="flex-1">
                                                    <p className={`font-medium ${
                                                        result.success 
                                                            ? 'text-green-800 dark:text-green-200' 
                                                            : 'text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {result.success ? 'Успешно загружен' : 'Ошибка загрузки'}: {result.originalFile.name}
                                                    </p>
                                                    {!result.success && (
                                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                            {result.error}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Предпросмотр изображения */}
                        {previewFile && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Eye size={24} className="text-blue-500" />
                                    Предпросмотр
                                </h3>
                                <div className="relative">
                                    <img
                                        src={URL.createObjectURL(previewFile)}
                                        alt="Предпросмотр"
                                        className="max-w-full max-h-80 rounded-xl shadow-lg object-contain bg-gray-100 dark:bg-gray-800"
                                    />
                                    <button
                                        onClick={() => setPreviewFile(null)}
                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-all duration-200"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Прогресс загрузки с улучшенным дизайном */}
                    {uploading && (
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        Загрузка файлов...
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {Math.round(uploadProgress)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Кнопки с улучшенным дизайном */}
                    <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                        <button
                            onClick={closeModal}
                            disabled={uploading}
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 font-medium"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={uploadFiles}
                            disabled={selectedFiles.length === 0 || uploading}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none font-medium text-lg"
                        >
                            {uploading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Загрузка...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Upload size={20} />
                                    Загрузить {selectedFiles.length} файл{selectedFiles.length === 1 ? '' : selectedFiles.length < 5 ? 'а' : 'ов'}
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
