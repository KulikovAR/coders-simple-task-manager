import { Node, mergeAttributes } from '@tiptap/core';

export default Node.create({
    name: 'fileAttachment',
    
    group: 'block',
    
    atom: true,
    
    addAttributes() {
        return {
            id: {
                default: null,
            },
            filename: {
                default: null,
            },
            size: {
                default: null,
            },
            mimeType: {
                default: null,
            },
            url: {
                default: null,
            },
            description: {
                default: null,
            },
        };
    },
    
    parseHTML() {
        return [
            {
                tag: 'div[data-type="file-attachment"]',
                getAttrs: (node) => {
                    if (typeof node === 'string') return false;
                    
                    // Пытаемся получить данные из data-атрибутов
                    const id = node.getAttribute('data-file-id');
                    const filename = node.getAttribute('data-filename');
                    const size = parseInt(node.getAttribute('data-size') || '0');
                    const mimeType = node.getAttribute('data-mime-type');
                    const url = node.getAttribute('data-url');
                    const description = node.getAttribute('data-description');
                    
                    // Если есть все необходимые данные, возвращаем их
                    if (id && filename && url) {
                        return {
                            id,
                            filename,
                            size,
                            mimeType: mimeType || 'application/octet-stream',
                            url,
                            description: description || '',
                        };
                    }
                    
                    // Fallback: пытаемся извлечь данные из HTML структуры
                    const filenameElement = node.querySelector('.file-attachment-filename');
                    const sizeElement = node.querySelector('.file-attachment-size');
                    const linkElement = node.querySelector('a[href]');
                    
                    if (filenameElement && linkElement) {
                        return {
                            id: id || 'unknown',
                            filename: filenameElement.textContent || 'Файл',
                            size: size || (sizeElement ? parseInt(sizeElement.textContent.match(/\d+/)?.[0] || '0') : 0),
                            mimeType: mimeType || this.guessMimeType(filenameElement.textContent),
                            url: linkElement.getAttribute('href') || url || '',
                            description: description || '',
                        };
                    }
                    
                    return false;
                },
            },
            // Добавляем поддержку для простого текста с информацией о файле
            {
                tag: 'p',
                getAttrs: (node) => {
                    if (typeof node === 'string') return false;
                    
                    const text = node.textContent || '';
                    
                    // Ищем паттерн: 🖼️Имя файла + размер
                    const filePattern = /([🖼️🎥🎵📄📝📊📽️📦])(.+?)(\d+\.?\d*\s*[КМ]?Б)/;
                    const match = text.match(filePattern);
                    
                    if (match) {
                        const icon = match[1];
                        const filename = match[2].trim();
                        const sizeText = match[3];
                        
                        // Определяем MIME тип по иконке
                        let mimeType = 'application/octet-stream';
                        if (icon === '🖼️') mimeType = 'image/png'; // или другой тип изображения
                        else if (icon === '📄') mimeType = 'application/pdf';
                        else if (icon === '📝') mimeType = 'application/msword';
                        else if (icon === '📦') mimeType = 'application/zip';
                        
                        // Парсим размер
                        const sizeMatch = sizeText.match(/(\d+\.?\d*)\s*([КМ]?Б)/);
                        let size = 0;
                        if (sizeMatch) {
                            const num = parseFloat(sizeMatch[1]);
                            const unit = sizeMatch[2];
                            if (unit === 'КБ') size = num * 1024;
                            else if (unit === 'МБ') size = num * 1024 * 1024;
                            else size = num;
                        }
                        
                        return {
                            id: 'recovered_' + Date.now(),
                            filename: filename,
                            size: size,
                            mimeType: mimeType,
                            url: '#', // Восстановленный файл не имеет URL
                            description: '',
                        };
                    }
                    
                    return false;
                },
            },
            // Добавляем поддержку для любого div с классом file-attachment-node
            {
                tag: 'div.file-attachment-node',
                getAttrs: (node) => {
                    if (typeof node === 'string') return false;
                    
                    // Ищем данные в HTML структуре
                    const filenameElement = node.querySelector('.file-attachment-filename');
                    const sizeElement = node.querySelector('.file-attachment-size');
                    const iconElement = node.querySelector('.file-attachment-icon');
                    const linkElement = node.querySelector('a[href]');
                    const imgElement = node.querySelector('img');
                    
                    if (filenameElement) {
                        const filename = filenameElement.textContent || 'Файл';
                        const size = sizeElement ? parseInt(sizeElement.textContent.match(/\d+/)?.[0] || '0') : 0;
                        const icon = iconElement ? iconElement.textContent : '📎';
                        
                        // Определяем MIME тип по иконке
                        let mimeType = 'application/octet-stream';
                        if (icon === '🖼️') mimeType = 'image/png';
                        else if (icon === '📄') mimeType = 'application/pdf';
                        else if (icon === '📝') mimeType = 'application/msword';
                        else if (icon === '📦') mimeType = 'application/zip';
                        
                        // Определяем URL
                        let url = '#';
                        if (linkElement) {
                            url = linkElement.getAttribute('href');
                        } else if (imgElement) {
                            url = imgElement.getAttribute('src');
                        }
                        
                        return {
                            id: 'recovered_' + Date.now(),
                            filename: filename,
                            size: size,
                            mimeType: mimeType,
                            url: url,
                            description: '',
                        };
                    }
                    
                    return false;
                },
            },
            // Специальная поддержка для изображений с превью
            {
                tag: 'div.file-attachment-image',
                getAttrs: (node) => {
                    if (typeof node === 'string') return false;
                    
                    // Ищем данные в HTML структуре для изображений
                    const filenameElement = node.querySelector('.file-attachment-filename');
                    const sizeElement = node.querySelector('.file-attachment-size');
                    const iconElement = node.querySelector('.file-attachment-icon');
                    const imgElement = node.querySelector('img');
                    
                    if (filenameElement && imgElement) {
                        const filename = filenameElement.textContent || 'Изображение';
                        const size = sizeElement ? parseInt(sizeElement.textContent.match(/\d+/)?.[0] || '0') : 0;
                        const icon = iconElement ? iconElement.textContent : '🖼️';
                        const url = imgElement.getAttribute('src');
                        
                        // Определяем MIME тип по иконке
                        let mimeType = 'image/png';
                        if (icon === '🖼️') mimeType = 'image/png';
                        else if (icon === '🎥') mimeType = 'video/mp4';
                        else if (icon === '🎵') mimeType = 'audio/mp3';
                        
                        return {
                            id: 'recovered_' + Date.now(),
                            filename: filename,
                            size: size,
                            mimeType: mimeType,
                            url: url,
                            description: '',
                        };
                    }
                    
                    return false;
                },
            },
        ];
    },
    
    renderHTML({ HTMLAttributes }) {
        const { id, filename, size, mimeType, url, description } = HTMLAttributes;
        
        // Создаем локальные функции для иконок и размера
        const getFileIcon = (mimeType) => {
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
        };
        
        const formatFileSize = (bytes) => {
            if (!bytes) return '';
            
            const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
            if (bytes === 0) return '0 Б';
            
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        };
        
        // Для изображений показываем превью, для остальных файлов - стандартный блок
        if (mimeType && mimeType.startsWith('image/')) {
            // Создаем URL для просмотра изображения (без скачивания)
            const viewUrl = url.replace('/download', '/view');
            
            return [
                'div',
                mergeAttributes(HTMLAttributes, {
                    'data-type': 'file-attachment',
                    'data-file-id': id,
                    'data-filename': filename,
                    'data-size': size,
                    'data-mime-type': mimeType,
                    'data-url': url,
                    'data-description': description,
                    class: 'file-attachment-node file-attachment-image',
                    contenteditable: 'false', // Делаем блок нередактируемым
                }),
                [
                    'div',
                    { class: 'file-attachment-content' },
                    [
                        'div',
                        { class: 'file-attachment-header' },
                        [
                            'span',
                            { class: 'file-attachment-icon' },
                            getFileIcon(mimeType),
                        ],
                        [
                            'span',
                            { class: 'file-attachment-filename' },
                            filename || 'Изображение',
                        ],
                        [
                            'span',
                            { class: 'file-attachment-size' },
                            formatFileSize(size),
                        ],
                    ],
                    [
                        'div',
                        { class: 'file-attachment-preview' },
                        [
                            'img',
                            {
                                src: url,
                                alt: filename || 'Изображение',
                                class: 'file-attachment-image-preview',
                                contenteditable: 'false', // Изображение тоже нередактируемое
                            },
                        ],
                    ],
                    description && [
                        'div',
                        { class: 'file-attachment-description' },
                        description,
                    ],
                    [
                        'div',
                        { class: 'file-attachment-actions' },
                        [
                            'button',
                            {
                                type: 'button',
                                class: 'file-attachment-action-btn file-attachment-view-btn',
                                'data-file-id': id,
                                'data-image-url': url,
                                'onclick': 'window.openImageModal(this.dataset.imageUrl)',
                            },
                            'Открыть изображение',
                        ],
                        [
                            'a',
                            {
                                href: url,
                                download: filename,
                                class: 'file-attachment-action-btn file-attachment-download-btn',
                            },
                            'Скачать',
                        ],
                    ],
                ],
            ];
        } else {
            // Стандартный блок для не-изображений
            return [
                'div',
                mergeAttributes(HTMLAttributes, {
                    'data-type': 'file-attachment',
                    'data-file-id': id,
                    'data-filename': filename,
                    'data-size': size,
                    'data-mime-type': mimeType,
                    'data-url': url,
                    'data-description': description,
                    class: 'file-attachment-node',
                    contenteditable: 'false', // Делаем блок нередактируемым
                }),
                [
                    'div',
                    { class: 'file-attachment-content' },
                    [
                        'div',
                        { class: 'file-attachment-header' },
                        [
                            'span',
                            { class: 'file-attachment-icon' },
                            getFileIcon(mimeType),
                        ],
                        [
                            'span',
                            { class: 'file-attachment-filename' },
                            filename || 'Файл',
                        ],
                        [
                            'span',
                            { class: 'file-attachment-size' },
                            formatFileSize(size),
                        ],
                    ],
                    description && [
                        'div',
                        { class: 'file-attachment-description' },
                        description,
                    ],
                    [
                        'div',
                        { class: 'file-attachment-actions' },
                        [
                            'a',
                            {
                                href: url,
                                download: filename,
                                class: 'file-attachment-action-btn file-attachment-download-btn',
                            },
                            'Скачать',
                        ],
                    ],
                ],
            ];
        }
    },
    
    addCommands() {
        return {
            setFileAttachment:
                (attributes) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: attributes,
                    });
                },
            restoreFileAttachment:
                (attributes) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: attributes,
                    });
                },
            // Команда для принудительного восстановления всех файлов
            restoreAllFileAttachments:
                () =>
                ({ commands, state }) => {
                    let restored = false;
                    
                    // Проходим по всем узлам и ищем файлы для восстановления
                    state.doc.descendants((node, pos) => {
                        if (node.type.name === 'paragraph') {
                            const text = node.textContent || '';
                            
                            // Ищем паттерн файла
                            const filePattern = /([🖼️🎥🎵📄📝📊📽️📦])(.+?)(\d+\.?\d*\s*[КМ]?Б)/;
                            const match = text.match(filePattern);
                            
                            if (match) {
                                const icon = match[1];
                                const filename = match[2].trim();
                                const sizeText = match[3];
                                
                                // Определяем MIME тип по иконке
                                let mimeType = 'application/octet-stream';
                                if (icon === '🖼️') mimeType = 'image/png';
                                else if (icon === '📄') mimeType = 'application/pdf';
                                else if (icon === '📝') mimeType = 'application/msword';
                                else if (icon === '📦') mimeType = 'application/zip';
                                
                                // Парсим размер
                                const sizeMatch = sizeText.match(/(\d+\.?\d*)\s*([КМ]?Б)/);
                                let size = 0;
                                if (sizeMatch) {
                                    const num = parseFloat(sizeMatch[1]);
                                    const unit = sizeMatch[2];
                                    if (unit === 'КБ') size = num * 1024;
                                    else if (unit === 'МБ') size = num * 1024 * 1024;
                                    else size = num;
                                }
                                
                                // Восстанавливаем файл
                                commands.deleteRange({ from: pos, to: pos + node.nodeSize });
                                commands.setFileAttachment({
                                    id: 'recovered_' + Date.now(),
                                    filename: filename,
                                    size: size,
                                    mimeType: mimeType,
                                    url: '#',
                                    description: '',
                                });
                                
                                restored = true;
                                return false; // Останавливаем поиск после первого восстановления
                            }
                        }
                    });
                    
                    return restored;
                },
        };
    },
    
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
    },
    
    formatFileSize(bytes) {
        if (!bytes) return '';
        
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        if (bytes === 0) return '0 Б';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    guessMimeType(filename) {
        if (!filename) return 'application/octet-stream';
        
        const ext = filename.toLowerCase().split('.').pop();
        
        const mimeTypes = {
            // Изображения
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'bmp': 'image/bmp',
            
            // Документы
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'csv': 'text/csv',
            
            // Архивы
            'zip': 'application/zip',
            'rar': 'application/vnd.rar',
            '7z': 'application/x-7z-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip',
            
            // Аудио
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'aac': 'audio/aac',
            
            // Видео
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',
            'webm': 'video/webm',
        };
        
        return mimeTypes[ext] || 'application/octet-stream';
    },
});
