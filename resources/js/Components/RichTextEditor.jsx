import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Link as LinkIcon, 
    Image as ImageIcon,
    Undo,
    Redo,
    Code,
    Quote
} from 'lucide-react';

export default function RichTextEditor({
    value = '',
    onChange,
    onMentionSelect,
    users = [],
    placeholder = 'Начните писать...',
    className = '',
    rows = 4,
    ...props
}) {
    // Проверяем, является ли устройство мобильным
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Проверяем обязательные пропсы
    if (typeof onChange !== 'function') {
        console.error('RichTextEditor: onChange должен быть функцией');
        return null;
    }
    
    // Проверяем, что users является массивом
    if (!Array.isArray(users)) {
        console.warn('RichTextEditor: users должен быть массивом, получено:', typeof users);
    }
    
    // CSS стили для редактора
    const editorStyles = `
        .ProseMirror {
            min-height: 280px;
            outline: none;
            padding: 0;
            cursor: text;
        }
        
        /* Стили для popup'а упоминаний */
        .mention-suggestions {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            max-height: 200px;
            overflow-y: auto;
            min-width: 250px;
            z-index: 9999;
        }
        
        .mention-suggestions::-webkit-scrollbar {
            width: 6px;
        }
        
        .mention-suggestions::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .mention-suggestions::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }
        
        .mention-suggestions::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }
        .ProseMirror p {
            margin: 0.5em 0;
            min-height: 1.5em;
        }
        .ProseMirror p:first-child {
            margin-top: 0;
        }
        .ProseMirror p:last-child {
            margin-bottom: 0;
        }
        .ProseMirror:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
        }
        .ProseMirror-focused {
            outline: none;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
            margin: 1em 0 0.5em 0;
        }
        .ProseMirror ul, .ProseMirror ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
        }
        .ProseMirror li {
            margin: 0.25em 0;
        }
        .ProseMirror blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 3px solid #e5e7eb;
            font-style: italic;
        }
        .ProseMirror code {
            background-color: #f3f4f6;
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
            font-family: monospace;
        }
        .ProseMirror pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 1em;
            border-radius: 0.5em;
            overflow-x: auto;
        }
        .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5em;
        }
        .ProseMirror a {
            color: #3b82f6;
            text-decoration: underline;
        }
        .is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
        }
    `;
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    
    // Реф для хранения текущего popup'а упоминаний
    const currentMentionPopup = useRef(null);

    // Функция для скрытия mention popup'а
    const hideMentionPopup = useCallback(() => {
        if (currentMentionPopup.current) {
            try {
                // Проверяем, что popup все еще существует в DOM
                if (currentMentionPopup.current.parentNode) {
                    if (currentMentionPopup.current._clickOutsideHandler) {
                        try {
                            document.removeEventListener('mousedown', currentMentionPopup.current._clickOutsideHandler);
                        } catch (error) {
                            console.warn('Ошибка при удалении обработчика клика:', error);
                        }
                    }
                    currentMentionPopup.current.remove();
                }
                currentMentionPopup.current = null;
            } catch (error) {
                console.warn('Ошибка при скрытии mention popup:', error);
                // Принудительно очищаем ссылку
                currentMentionPopup.current = null;
            }
        }
    }, []);

    // Нормализуем массив пользователей для упоминаний
    const normalizedUsers = useMemo(() => {
        try {
            if (!users || !Array.isArray(users)) {
                console.warn('RichTextEditor: users не является массивом:', users);
                return [];
            }
            
            return users.map(user => {
                // Если это ProjectMember, получаем пользователя из связи
                if (user && user.user) {
                    return {
                        id: user.user.id,
                        name: user.user.name || 'Неизвестный пользователь',
                        email: user.user.email || 'unknown@example.com'
                    };
                }
                // Если это обычный User
                if (user && user.id) {
                    return {
                        id: user.id,
                        name: user.name || 'Неизвестный пользователь',
                        email: user.email || 'unknown@example.com'
                    };
                }
                return null;
            }).filter(user => user && user.name && user.name !== 'Неизвестный пользователь');
        } catch (error) {
            console.error('Ошибка при нормализации пользователей:', error);
            return [];
        }
    }, [users]);

    // Отладочная информация
    console.log('RichTextEditor - исходные пользователи:', users);
    console.log('RichTextEditor - нормализованные пользователи:', normalizedUsers);
    console.log('RichTextEditor - мобильное устройство:', isMobile);

    // Создание экземпляра редактора
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            // Убираем дублирующее расширение Link, так как оно уже есть в StarterKit
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'bg-accent-blue/10 text-accent-blue px-1.5 py-0.5 rounded text-sm font-medium',
                },
                suggestion: {
                    items: ({ query }) => {
                        console.log('Mention items - query:', query);
                        console.log('Mention items - normalizedUsers:', normalizedUsers);
                        
                        // Проверяем, что массив пользователей не пустой
                        if (!normalizedUsers || normalizedUsers.length === 0) {
                            console.log('Mention items - нет пользователей для упоминания');
                            return [];
                        }
                        
                        if (!query) {
                            const result = normalizedUsers.slice(0, 5);
                            console.log('Mention items - без запроса, результат:', result);
                            return result;
                        }
                        
                        const result = normalizedUsers.filter(user => 
                            user.name.toLowerCase().includes(query.toLowerCase()) ||
                            user.email.toLowerCase().includes(query.toLowerCase())
                        ).slice(0, 5);
                        
                        console.log('Mention items - с запросом, результат:', result);
                        return result;
                    },
                    renderItem: (item) => {
                        return {
                            id: item.id,
                            label: item.name,
                            name: item.name,
                            email: item.email,
                        };
                    },
                    command: ({ editor, range, props }) => {
                        // Отладочная информация
                        console.log('Mention command - props:', props);
                        console.log('Mention command - props.label:', props.label);
                        console.log('Mention command - props.name:', props.name);
                        
                        // Вставляем упоминание с email пользователя
                        const userEmail = props.email || 'unknown@example.com';
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .insertContent(`@${userEmail}`)
                            .run();
                        
                        // Вызываем колбэк для родительского компонента с правильным пользователем
                        if (onMentionSelect) {
                            console.log('Mention command - вызываем onMentionSelect с:', props);
                            onMentionSelect(props);
                        }
                    },
                    render: () => {
                        let component;
                        let popup;

                        return {
                            onStart: props => {
                                // Проверяем, что есть пользователи для отображения
                                if (!props.items || props.items.length === 0) {
                                    return;
                                }

                                // Проверяем, что редактор готов
                                if (!props.editor || props.editor.isDestroyed || !props.editor.view || !props.editor.view.dom) {
                                    console.warn('Редактор не готов для отображения mention popup');
                                    return;
                                }

                                try {
                                    component = new MentionList({
                                        props,
                                        editor: props.editor,
                                        onExit: () => {
                                            if (popup) {
                                                popup.remove();
                                                currentMentionPopup.current = null;
                                            }
                                        }
                                    });

                                    if (!props.clientRect) {
                                        return;
                                    }

                                    popup = document.createElement('div');
                                    popup.className = 'mention-suggestions';
                                    popup.style.position = 'fixed';
                                    popup.style.zIndex = '9999';
                                    document.body.appendChild(popup);
                                    popup.appendChild(component.element);
                                    
                                    // Сохраняем ссылку на текущий popup
                                    currentMentionPopup.current = popup;
                                    
                                    // Позиционируем popup
                                    const rect = props.clientRect();
                                    if (rect) {
                                        // Простое позиционирование под курсором
                                        popup.style.left = `${rect.left}px`;
                                        popup.style.top = `${rect.bottom + 8}px`;
                                        
                                        // Проверяем, не выходит ли popup за границы экрана
                                        const popupRect = popup.getBoundingClientRect();
                                        const viewportWidth = window.innerWidth;
                                        const viewportHeight = window.innerHeight;
                                        
                                        // Если popup выходит за правый край
                                        if (popupRect.right > viewportWidth - 16) {
                                            popup.style.left = `${viewportWidth - popupRect.width - 16}px`;
                                        }
                                        
                                        // Если popup выходит за нижний край
                                        if (popupRect.bottom > viewportHeight - 16) {
                                            popup.style.top = `${rect.top - popupRect.height - 8}px`;
                                        }
                                        
                                        // Если popup выходит за левый край
                                        if (popupRect.left < 16) {
                                            popup.style.left = '16px';
                                        }
                                        
                                        // Если popup выходит за верхний край
                                        if (popupRect.top < 16) {
                                            popup.style.top = '16px';
                                        }
                                    }
                                    
                                    // Обработчик клика вне popup
                                    const handleClickOutside = (event) => {
                                        if (popup && !popup.contains(event.target) && !props.editor.isDestroyed) {
                                            // Безопасная проверка view.dom
                                            try {
                                                const editorElement = props.editor.view?.dom;
                                                if (editorElement && !editorElement.contains(event.target)) {
                                                    popup.remove();
                                                    currentMentionPopup.current = null;
                                                }
                                            } catch (error) {
                                                console.warn('Ошибка при проверке клика вне popup:', error);
                                                popup.remove();
                                                currentMentionPopup.current = null;
                                            }
                                        }
                                    };
                                    
                                    setTimeout(() => {
                                        try {
                                            document.addEventListener('mousedown', handleClickOutside);
                                            popup._clickOutsideHandler = handleClickOutside;
                                        } catch (error) {
                                            console.warn('Ошибка при добавлении обработчика клика вне popup:', error);
                                        }
                                    }, 100);
                                    
                                    // Убираем дублирующий вызов onMentionSelect
                                    // if (onMentionSelect) {
                                    //     onMentionSelect(props.items[props.index]);
                                    // }
                                } catch (error) {
                                    console.error('Ошибка при создании mention popup:', error);
                                    if (popup) {
                                        popup.remove();
                                        currentMentionPopup.current = null;
                                    }
                                }
                            },
                            onUpdate(props) {
                                if (!component) return;
                                
                                try {
                                    component.updateProps(props);

                                    if (!props.clientRect || !popup) {
                                        return;
                                    }

                                    // Обновляем позицию с той же логикой
                                    const rect = props.clientRect();
                                    if (rect) {
                                        // Простое позиционирование под курсором
                                        popup.style.left = `${rect.left}px`;
                                        popup.style.top = `${rect.bottom + 8}px`;
                                        
                                        // Проверяем, не выходит ли popup за границы экрана
                                        const popupRect = popup.getBoundingClientRect();
                                        const viewportWidth = window.innerWidth;
                                        const viewportHeight = window.innerHeight;
                                        
                                        // Если popup выходит за правый край
                                        if (popupRect.right > viewportWidth - 16) {
                                            popup.style.left = `${viewportWidth - popupRect.width - 16}px`;
                                        }
                                        
                                        // Если popup выходит за нижний край
                                        if (popupRect.bottom > viewportHeight - 16) {
                                            popup.style.top = `${rect.top - popupRect.height - 8}px`;
                                        }
                                        
                                        // Если popup выходит за левый край
                                        if (popupRect.left < 16) {
                                            popup.style.left = '16px';
                                        }
                                        
                                        // Если popup выходит за верхний край
                                        if (popupRect.top < 16) {
                                            popup.style.top = '16px';
                                        }
                                    }
                                } catch (error) {
                                    console.error('Ошибка при обновлении mention popup:', error);
                                }
                            },
                            onKeyDown(props) {
                                if (!component) return false;
                                try {
                                    return component.onKeyDown(props);
                                } catch (error) {
                                    console.error('Ошибка при обработке клавиш в mention popup:', error);
                                    return false;
                                }
                            },
                            onExit() {
                                try {
                                    if (popup) {
                                        if (popup._clickOutsideHandler) {
                                            document.removeEventListener('mousedown', popup._clickOutsideHandler);
                                        }
                                        popup.remove();
                                        currentMentionPopup.current = null;
                                    }
                                    if (component) {
                                        component.destroy();
                                    }
                                } catch (error) {
                                    console.error('Ошибка при закрытии mention popup:', error);
                                    // Принудительно очищаем ссылки
                                    currentMentionPopup.current = null;
                                }
                            },
                        };
                    },
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
    });

    // Обработчик скролла страницы
    useEffect(() => {
        // На мобильных устройствах скролл может быть более частым, добавляем throttling
        let timeoutId;
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                try {
                    hideMentionPopup();
                } catch (error) {
                    console.warn('Ошибка при обработке скролла:', error);
                }
            }, isMobile ? 50 : 0);
        };

        // Добавляем обработчики для всех возможных элементов с прокруткой
        const scrollableElements = [
            window,
            document.documentElement,
            document.body
        ];

        scrollableElements.forEach(element => {
            try {
                element.addEventListener('scroll', handleScroll, { passive: true });
            } catch (error) {
                console.warn('Ошибка при добавлении обработчика скролла:', error);
            }
        });

        return () => {
            clearTimeout(timeoutId);
            scrollableElements.forEach(element => {
                try {
                    element.removeEventListener('scroll', handleScroll);
                } catch (error) {
                    console.warn('Ошибка при удалении обработчика скролла:', error);
                }
            });
        };
    }, [hideMentionPopup, isMobile]);

    // Обработчик изменения размера окна
    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                try {
                    hideMentionPopup();
                } catch (error) {
                    console.warn('Ошибка при обработке изменения размера:', error);
                }
            }, isMobile ? 100 : 0);
        };

        try {
            window.addEventListener('resize', handleResize, { passive: true });
        } catch (error) {
            console.warn('Ошибка при добавлении обработчика изменения размера:', error);
        }

        return () => {
            clearTimeout(timeoutId);
            try {
                window.removeEventListener('resize', handleResize);
            } catch (error) {
                console.warn('Ошибка при удалении обработчика изменения размера:', error);
            }
        };
    }, [hideMentionPopup, isMobile]);

    // Обработчик потери фокуса редактором
    useEffect(() => {
        const handleBlur = () => {
            // На мобильных устройствах увеличиваем задержку
            const delay = isMobile ? 200 : 100;
            setTimeout(() => {
                hideMentionPopup();
            }, delay);
        };

        // Ждем полной инициализации редактора
        if (editor && editor.isDestroyed === false) {
            const checkEditorReady = () => {
                try {
                    if (editor.view && editor.view.dom && !editor.isDestroyed) {
                        const editorElement = editor.view.dom;
                        editorElement.addEventListener('blur', handleBlur);
                        
                        return () => {
                            try {
                                if (editorElement && !editor.isDestroyed) {
                                    editorElement.removeEventListener('blur', handleBlur);
                                }
                            } catch (error) {
                                console.warn('Ошибка при удалении обработчика blur:', error);
                            }
                        };
                    } else {
                        // Если редактор еще не готов, пробуем снова через 100ms
                        setTimeout(checkEditorReady, 100);
                        return () => {};
                    }
                } catch (error) {
                    console.warn('Ошибка при проверке готовности редактора:', error);
                    return () => {};
                }
            };

            const cleanup = checkEditorReady();
            return cleanup;
        }
    }, [editor, hideMentionPopup, isMobile]);

    // Обработчик нажатия Escape
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                hideMentionPopup();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [hideMentionPopup]);

    // Обработчик касания для мобильных устройств
    useEffect(() => {
        if (!isMobile) return;

        const handleTouchStart = (event) => {
            try {
                // Если касание произошло вне mention popup, скрываем его
                if (currentMentionPopup.current && !currentMentionPopup.current.contains(event.target)) {
                    try {
                        const editorElement = editor?.view?.dom;
                        if (editorElement && !editorElement.contains(event.target)) {
                            hideMentionPopup();
                        }
                    } catch (error) {
                        console.warn('Ошибка при обработке касания:', error);
                        hideMentionPopup();
                    }
                }
            } catch (error) {
                console.warn('Ошибка при обработке касания:', error);
            }
        };

        try {
            document.addEventListener('touchstart', handleTouchStart, { passive: true });
        } catch (error) {
            console.warn('Ошибка при добавлении обработчика касания:', error);
        }

        return () => {
            try {
                document.removeEventListener('touchstart', handleTouchStart);
            } catch (error) {
                console.warn('Ошибка при удалении обработчика касания:', error);
            }
        };
    }, [isMobile, hideMentionPopup, editor]);

    // Обновляем содержимое редактора при изменении value пропса
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            try {
                // Проверяем, что редактор готов
                if (editor.view && editor.view.dom && !editor.isDestroyed) {
                    editor.commands.setContent(value);
                }
            } catch (error) {
                console.warn('Ошибка при обновлении содержимого редактора:', error);
            }
        }
    }, [value, editor]);

    // Обработка вставки изображения по URL
    const addImage = useCallback(() => {
        if (imageUrl && editor) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
            setShowImageInput(false);
        }
    }, [imageUrl, editor]);

    // Обработка добавления ссылки
    const addLink = useCallback(() => {
        if (linkUrl && editor) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    }, [linkUrl, editor]);

    // Обработка drag & drop файлов
    const handleDrop = useCallback((event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (editor) {
                        editor.chain().focus().setImage({ src: e.target.result }).run();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }, [editor]);

    // Обработка выбора файла
    const handleFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (editor) {
                    editor.chain().focus().setImage({ src: e.target.result }).run();
                }
            };
            reader.readAsDataURL(file);
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    // Дополнительная проверка готовности редактора
    if (!editor.view || !editor.view.dom || editor.isDestroyed) {
        return (
            <div className={`border border-border-color rounded-lg ${className}`}>
                <div className="flex items-center justify-center p-8 text-text-muted">
                    Загрузка редактора...
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{editorStyles}</style>
            <div className={`border border-border-color rounded-lg ${className}`}>
                {/* Панель инструментов */}
            <div className="flex items-center gap-1 p-2 border-b border-border-color bg-secondary-bg">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 ${
                        editor.isActive('bold') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Жирный"
                >
                    <Bold size={16} />
                </button>
                
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 ${
                        editor.isActive('italic') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Курсив"
                >
                    <Italic size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 ${
                        editor.isActive('code') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Код"
                >
                    <Code size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 ${
                        editor.isActive('blockquote') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Цитата"
                >
                    <Quote size={16} />
                </button>

                <div className="w-px h-6 bg-border-color mx-2" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 ${
                        editor.isActive('bulletList') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Маркированный список"
                >
                    <List size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 ${
                        editor.isActive('orderedList') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Нумерованный список"
                >
                    <ListOrdered size={16} />
                </button>

                <div className="w-px h-6 bg-border-color mx-2" />

                <button
                    type="button"
                    onClick={() => setShowLinkInput(true)}
                    className={`p-2 rounded hover:bg-accent-blue/10 ${
                        editor.isActive('link') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Добавить ссылку"
                >
                    <LinkIcon size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => setShowImageInput(true)}
                    className="p-2 rounded hover:bg-accent-blue/10 text-text-primary"
                    title="Добавить изображение"
                >
                    <ImageIcon size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded hover:bg-accent-blue/10 text-text-primary"
                    title="Загрузить файл"
                >
                    📎
                </button>

                <div className="w-px h-6 bg-border-color mx-2" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-accent-blue/10 text-text-primary disabled:opacity-50"
                    title="Отменить"
                >
                    <Undo size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-accent-blue/10 text-text-primary disabled:opacity-50"
                    title="Повторить"
                >
                    <Redo size={16} />
                </button>
            </div>

            {/* Поле ввода ссылки */}
            {showLinkInput && (
                <div className="p-2 border-b border-border-color bg-secondary-bg">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="Введите URL ссылки"
                            className="flex-1 px-3 py-1 text-sm border border-border-color rounded bg-card-bg text-text-primary"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addLink();
                                if (e.key === 'Escape') setShowLinkInput(false);
                            }}
                        />
                        <button
                            onClick={addLink}
                            className="px-3 py-1 text-sm bg-accent-blue text-white rounded hover:bg-accent-blue/90"
                        >
                            Добавить
                        </button>
                        <button
                            onClick={() => setShowLinkInput(false)}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Поле ввода изображения */}
            {showImageInput && (
                <div className="p-2 border-b border-border-color bg-secondary-bg">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Введите URL изображения"
                            className="flex-1 px-3 py-1 text-sm border border-border-color rounded bg-card-bg text-text-primary"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addImage();
                                if (e.key === 'Escape') setShowImageInput(false);
                            }}
                        />
                        <button
                            onClick={addImage}
                            className="px-3 py-1 text-sm bg-accent-blue text-white rounded hover:bg-accent-blue/90"
                        >
                            Добавить
                        </button>
                        <button
                            onClick={() => setShowImageInput(false)}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Основная область редактирования */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="min-h-[300px] p-3 bg-card-bg"
            >
                <EditorContent 
                    editor={editor} 
                    className="prose prose-sm max-w-none focus:outline-none min-h-[280px]"
                />
            </div>

            {/* Скрытые input'ы для файлов */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
        </>
    );
}

// Компонент для отображения списка упоминаний
class MentionList {
    constructor({ props, editor, onExit }) {
        this.props = props;
        this.editor = editor;
        this.element = document.createElement('div');
        this.element.className = 'w-full bg-transparent';
        this.onExit = onExit;
        this.render();
    }

    render() {
        try {
            console.log('MentionList render - props.items:', this.props.items);
            console.log('MentionList render - props.index:', this.props.index);
            
            // Проверяем, что есть элементы для отображения
            if (!this.props.items || this.props.items.length === 0) {
                this.element.innerHTML = `
                    <div class="px-3 py-2 text-sm text-text-muted">
                        Нет пользователей для упоминания
                    </div>
                `;
                return;
            }
            
            this.element.innerHTML = `
                ${this.props.items.map((item, index) => `
                    <div class="px-3 py-2 cursor-pointer flex items-center space-x-3 hover:bg-accent-blue/10 transition-colors duration-150 ${
                        index === this.props.index ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }" data-index="${index}">
                        <div class="w-8 h-8 bg-accent-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-semibold text-accent-blue">
                                ${item.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium truncate text-text-primary">${item.name}</div>
                            <div class="text-xs text-text-muted truncate">${item.email}</div>
                        </div>
                    </div>
                `).join('')}
            `;

            this.element.addEventListener('click', (e) => {
                const item = e.target.closest('[data-index]');
                if (item) {
                    const index = parseInt(item.dataset.index);
                    const selectedItem = this.props.items[index];
                    console.log('MentionList click - выбран элемент:', selectedItem);
                    console.log('MentionList click - индекс:', index);
                    this.props.command(selectedItem);
                }
            });
        } catch (error) {
            console.error('Ошибка при рендеринге MentionList:', error);
            this.element.innerHTML = `
                <div class="px-3 py-2 text-sm text-red-500">
                    Ошибка при загрузке списка пользователей
                </div>
            `;
        }
    }

    updateProps(props) {
        try {
            this.props = props;
            this.render();
        } catch (error) {
            console.error('Ошибка при обновлении props MentionList:', error);
        }
    }

    onKeyDown(props) {
        try {
            if (props.event.key === 'ArrowUp') {
                this.up();
                return true;
            }

            if (props.event.key === 'ArrowDown') {
                this.down();
                return true;
            }

            if (props.event.key === 'Enter' || props.event.key === 'Tab') {
                this.select();
                return true;
            }

            if (props.event.key === 'Escape') {
                if (this.onExit) {
                    this.onExit();
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error('Ошибка при обработке клавиш в MentionList:', error);
            return false;
        }
    }

    up() {
        try {
            const prev = this.props.items[this.props.index - 1];
            if (prev) {
                this.props.index = this.props.index - 1;
                this.render();
            }
        } catch (error) {
            console.error('Ошибка при навигации вверх в MentionList:', error);
        }
    }

    down() {
        try {
            const next = this.props.items[this.props.index + 1];
            if (next) {
                this.props.index = this.props.index + 1;
                this.render();
            }
        } catch (error) {
            console.error('Ошибка при навигации вниз в MentionList:', error);
        }
    }

    select() {
        try {
            const item = this.props.items[this.props.index];
            if (item) {
                console.log('MentionList select - выбран элемент:', item);
                console.log('MentionList select - индекс:', this.props.index);
                this.props.command(item);
            }
        } catch (error) {
            console.error('Ошибка при выборе элемента в MentionList:', error);
        }
    }

    destroy() {
        try {
            if (this.element && this.element.parentNode) {
                this.element.remove();
            }
        } catch (error) {
            console.error('Ошибка при уничтожении MentionList:', error);
        }
    }
}
