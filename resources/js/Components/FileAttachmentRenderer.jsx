import React, { useEffect, useRef } from 'react';

export default function FileAttachmentRenderer({ content, className = '' }) {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            // Добавляем обработчики для кнопок файлов
            const fileNodes = contentRef.current.querySelectorAll('.file-attachment-node');
            
            fileNodes.forEach(node => {
                // Обработчик для кнопки "Открыть изображение"
                const viewBtn = node.querySelector('.file-attachment-view-btn');
                if (viewBtn) {
                    viewBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const imageUrl = viewBtn.dataset.imageUrl;
                        if (imageUrl && window.openImageModal) {
                            window.openImageModal(imageUrl);
                        }
                    });
                }
                
                // Обработчик для кнопки "Удалить"
                const deleteBtn = node.querySelector('.file-attachment-delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const fileId = deleteBtn.dataset.fileId;
                        if (fileId && window.deleteFileAttachment) {
                            window.deleteFileAttachment(fileId);
                        }
                    });
                }
            });
        }
    }, [content]);

    if (!content) return null;

    return (
        <div 
            className={className}
            dangerouslySetInnerHTML={{ __html: content }}
            ref={contentRef}
        />
    );
}
