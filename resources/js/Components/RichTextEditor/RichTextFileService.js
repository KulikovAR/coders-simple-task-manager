/**
 * Сервис для работы с файлами в RichTextEditor
 * Обрабатывает загрузку файлов и возвращает данные для вставки в редактор
 */
class RichTextFileService {
    constructor() {
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = [
            // Документы
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            // Архивы
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            // Аудио
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            // Видео
            'video/mp4',
            'video/avi',
            'video/mov',
            'video/wmv',
            'video/webm',
            // Изображения (уже поддерживаются)
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
    }

    /**
     * Проверяет, можно ли загрузить файл
     */
    canUploadFile(file) {
        // Проверяем размер
        if (file.size > this.maxFileSize) {
            return {
                canUpload: false,
                error: `Файл слишком большой. Максимальный размер: ${this.formatFileSize(this.maxFileSize)}`
            };
        }

        // Проверяем тип
        if (!this.allowedTypes.includes(file.type)) {
            return {
                canUpload: false,
                error: `Неподдерживаемый тип файла: ${file.type}`
            };
        }

        return { canUpload: true };
    }

    /**
     * Загружает файл на сервер
     */
    async uploadFile(file, attachableType, attachableId, description = '') {
        try {
            const validation = this.canUploadFile(file);
            if (!validation.canUpload) {
                throw new Error(validation.error);
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('attachable_type', attachableType);
            formData.append('attachable_id', attachableId);
            if (description) {
                formData.append('description', description);
            }

            const response = await fetch('/file-upload', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.getCsrfToken(),
                },
                body: formData,
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка загрузки файла');
            }

            const result = await response.json();
            console.log('RichTextFileService: Ответ сервера:', result);
            
            if (!result.success) {
                throw new Error(result.message || 'Ошибка загрузки файла');
            }

            if (!result.data) {
                console.error('RichTextFileService: result.data отсутствует:', result);
                throw new Error('Некорректный ответ сервера: отсутствуют данные файла');
            }

            return {
                success: true,
                file: result.data,
                message: 'Файл успешно загружен'
            };

        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            return {
                success: false,
                error: error.message || 'Неизвестная ошибка при загрузке файла'
            };
        }
    }

    /**
     * Удаляет файл с сервера
     */
    async deleteFile(fileId) {
        try {
            const response = await fetch(`/file-upload/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.getCsrfToken(),
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка удаления файла');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Ошибка удаления файла');
            }

            return {
                success: true,
                message: 'Файл успешно удален'
            };

        } catch (error) {
            console.error('Ошибка удаления файла:', error);
            return {
                success: false,
                error: error.message || 'Неизвестная ошибка при удалении файла'
            };
        }
    }

    /**
     * Получает статистику по файлам пользователя
     */
    async getUserFileStats() {
        try {
            const response = await fetch('/file-upload/user-stats', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Ошибка получения статистики');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Ошибка получения статистики');
            }

            return result.data;

        } catch (error) {
            console.error('Ошибка получения статистики файлов:', error);
            return null;
        }
    }

    /**
     * Форматирует размер файла для отображения
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 Б';
        
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        if (bytes === 0) return '0 Б';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Получает CSRF токен из мета-тега
     */
    getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.getAttribute('content') : '';
    }

    /**
     * Получает иконку для типа файла
     */
    getFileIcon(mimeType) {
        if (!mimeType) return '📎';
        
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
        if (mimeType.includes('text/')) return '📄';
        
        return '📎';
    }

    /**
     * Проверяет, является ли файл изображением
     */
    isImageFile(file) {
        return file.type.startsWith('image/');
    }

    /**
     * Проверяет, является ли файл документом
     */
    isDocumentFile(file) {
        return file.type.includes('pdf') || 
               file.type.includes('word') || 
               file.type.includes('excel') || 
               file.type.includes('powerpoint') ||
               file.type.includes('text/');
    }

    /**
     * Проверяет, является ли файл архивом
     */
    isArchiveFile(file) {
        return file.type.includes('zip') || 
               file.type.includes('rar') || 
               file.type.includes('7z');
    }

    /**
     * Проверяет, является ли файл аудио
     */
    isAudioFile(file) {
        return file.type.startsWith('audio/');
    }

    /**
     * Проверяет, является ли файл видео
     */
    isVideoFile(file) {
        return file.type.startsWith('video/');
    }
}

export default RichTextFileService;
