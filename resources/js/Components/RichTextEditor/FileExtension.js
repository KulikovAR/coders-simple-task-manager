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
            return [
                'div',
                mergeAttributes(HTMLAttributes, {
                    'data-type': 'file-attachment',
                    'data-file-id': id,
                    class: 'file-attachment-node file-attachment-image',
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
                                style: 'max-width: 100%; max-height: 300px; border-radius: 0.375rem;',
                            },
                        ],
                    ],
                    [
                        'div',
                        { class: 'file-attachment-details' },
                        [
                            'span',
                            { class: 'file-attachment-size' },
                            formatFileSize(size),
                        ],
                        description && [
                            'span',
                            { class: 'file-attachment-description' },
                            description,
                        ],
                    ],
                    [
                        'a',
                        {
                            href: url,
                            target: '_blank',
                            class: 'file-attachment-link',
                            'data-file-id': id,
                        },
                        'Открыть изображение',
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
                    class: 'file-attachment-node',
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
                    ],
                    [
                        'div',
                        { class: 'file-attachment-details' },
                        [
                            'span',
                            { class: 'file-attachment-size' },
                            formatFileSize(size),
                        ],
                        description && [
                            'span',
                            { class: 'file-attachment-description' },
                            description,
                        ],
                    ],
                    [
                        'a',
                        {
                            href: url,
                            target: '_blank',
                            class: 'file-attachment-link',
                            'data-file-id': id,
                        },
                        'Скачать',
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
});
