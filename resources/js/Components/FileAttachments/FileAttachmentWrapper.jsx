import React, { useEffect, useRef } from 'react';
import './FileAttachmentStyles.css';

/**
 * Универсальный компонент для отображения HTML контента с файлами
 * Автоматически подключает стили и обработчики для кнопок файлов
 */
export default function FileAttachmentWrapper({ 
    content, 
    className = '', 
    children,
    onFileView = null,
    onFileDelete = null,
    onFileDownload = null
}) {
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
                        
                        if (onFileView) {
                            onFileView(imageUrl);
                        } else if (window.openImageModal) {
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
                        
                        if (onFileDelete) {
                            onFileDelete(fileId);
                        } else if (window.deleteFileAttachment) {
                            window.deleteFileAttachment(fileId);
                        }
                    });
                }

                // Обработчик для кнопки "Скачать"
                const downloadBtn = node.querySelector('.file-attachment-download-btn');
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', (e) => {
                        const fileUrl = downloadBtn.href;
                        const fileName = downloadBtn.download;
                        
                        if (onFileDownload) {
                            e.preventDefault();
                            onFileDownload(fileUrl, fileName);
                        }
                    });
                }
            });
        }
    }, [content, onFileView, onFileDelete, onFileDownload]);

    // Если передали children, рендерим их
    if (children) {
        return (
            <div className={className} ref={contentRef}>
                {children}
            </div>
        );
    }

    // Если передали HTML контент, рендерим его
    if (content) {
        return (
            <div 
                className={className}
                dangerouslySetInnerHTML={{ __html: content }}
                ref={contentRef}
            />
        );
    }

    return null;
}
