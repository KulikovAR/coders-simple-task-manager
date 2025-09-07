import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import FileExtension from './RichTextEditor/FileExtension';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Paperclip,
    Undo,
    Redo,
    Code,
    Quote
} from 'lucide-react';
import FileUploadModal from './RichTextEditor/FileUploadModal';
import AiOptimizeButton from './RichTextEditor/AiOptimizeButton';

export default function RichTextEditor({
    value = '',
    onChange,
    onMentionSelect,
    users = [],
    placeholder = 'Начните писать...',
    className = '',
    rows = 4,
    attachableType = null,
    attachableId = null,
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

    // CSS стили для редактора с адаптивностью
    const editorStyles = `
        .ProseMirror {
            min-height: 280px;
            outline: none;
            padding: 0;
            cursor: text;
            word-wrap: break-word;
            overflow-wrap: break-word;
            color: var(--text-primary);
        }

        /* Стили для popup'а упоминаний с адаптивностью */
        .mention-suggestions {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            max-height: 200px;
            overflow-y: auto;
            min-width: 200px;
            max-width: calc(100vw - 32px);
            z-index: 9999;
        }

        /* Стили для упоминаний */
        .mention-list {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            overflow-y: auto;
            min-width: 200px;
            max-width: calc(100vw - 32px);
            z-index: 9999;
        }

        /* Специфичные стили для редактора */
        .ProseMirror .file-attachment-node {
            /* Дополнительные стили для редактора */
        }

        .ProseMirror .file-attachment-node[contenteditable="false"] {
            user-select: none;
            cursor: default;
        }

        .ProseMirror .file-attachment-node[contenteditable="false"] * {
            user-select: none;
        }

        .ProseMirror .file-attachment-node[contenteditable="false"] button,
        .ProseMirror .file-attachment-node[contenteditable="false"] a {
            user-select: none;
            cursor: pointer;
        }

        /* Стили для мобильной версии */
        @media (max-width: 768px) {
            .mention-suggestions {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: calc(100% - 32px) !important;
                max-height: 300px !important;
                background: var(--card-bg);
                border-radius: 1rem;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            }

            /* Затемнение фона */
            .mention-suggestions::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: -1;
            }

            /* Заголовок модального окна */
            .mention-suggestions::after {
                content: 'Выберите пользователя';
                display: block;
                padding: 1rem;
                font-size: 1rem;
                font-weight: 600;
                text-align: center;
                border-bottom: 1px solid var(--border-color);
                color: var(--text-primary);
            }
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
        .ProseMirror ul {
            margin: 0.5em 0;
            padding-left: 1.5em;
            list-style-type: disc !important;
        }
        .ProseMirror ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
            list-style-type: decimal !important;
        }
        .ProseMirror li {
            margin: 0.25em 0;
            display: list-item !important;
        }
        .ProseMirror li > ul {
            list-style-type: circle !important;
        }
        .ProseMirror li > ol {
            list-style-type: lower-alpha !important;
        }
        .ProseMirror li > ul > li > ul {
            list-style-type: square !important;
        }
        .ProseMirror li > ol > li > ol {
            list-style-type: lower-roman !important;
        }
        .ProseMirror blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 3px solid var(--border-color);
            font-style: italic;
            color: var(--text-muted);
            background-color: var(--blockquote-bg, rgba(0, 0, 0, 0.03));
        }
        .ProseMirror code {
            background-color: var(--code-bg, #f3f4f6);
            color: var(--text-primary);
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
            font-family: monospace;
        }
        .ProseMirror pre {
            background-color: var(--pre-bg, #1f2937);
            color: var(--pre-text, #f9fafb);
            padding: 1em;
            border-radius: 0.5em;
            overflow-x: auto;
        }
        .ProseMirror pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
        }
        .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5em;
        }
        .ProseMirror a {
            color: var(--accent-blue, #3b82f6);
            text-decoration: underline;
        }
        .ProseMirror a:hover {
            color: var(--accent-blue-hover, #2563eb);
        }
        .is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: var(--text-muted, #9ca3af);
            pointer-events: none;
            height: 0;
        }
        /* Темная тема */
        :root[data-theme="dark"] .ProseMirror {
            --code-bg: #374151;
            --pre-bg: #111827;
            --pre-text: #f9fafb;
            --blockquote-bg: rgba(255, 255, 255, 0.05);
        }
        /* Светлая тема */
        :root[data-theme="light"] .ProseMirror {
            --code-bg: #f3f4f6;
            --pre-bg: #1f2937;
            --pre-text: #f9fafb;
            --blockquote-bg: rgba(0, 0, 0, 0.03);
            color: var(--text-primary);
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

            return users
                .filter(user => user && user.id && user.name && user.email) // Проверяем наличие всех необходимых полей
                .map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email
                }));
        } catch (error) {
            console.error('Ошибка при нормализации пользователей:', error);
            return [];
        }
    }, [users]);


    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            FileExtension,
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
                        // Проверяем, что массив пользователей не пустой
                        if (!normalizedUsers || normalizedUsers.length === 0) {
                            return [];
                        }

                        if (!query) {
                            const result = normalizedUsers.slice(0, 5);
                            return result;
                        }

                        const result = normalizedUsers.filter(user =>
                            user.name.toLowerCase().includes(query.toLowerCase()) ||
                            user.email.toLowerCase().includes(query.toLowerCase())
                        ).slice(0, 5);

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
                        try {
                            // Вставляем упоминание с email пользователя
                            const userEmail = props.email || 'unknown@example.com';

                            // Вставляем упоминание в формате @email
                            editor
                                .chain()
                                .focus()
                                .deleteRange(range)
                                .insertContent(`@${userEmail}`)
                                .run();

                            // Вызываем колбэк для родительского компонента с правильным пользователем
                            if (onMentionSelect) {
                                onMentionSelect({
                                    id: props.id,
                                    name: props.name,
                                    email: userEmail
                                });
                            }

                            // Закрываем popup после выбора
                            const popup = document.querySelector('.mention-suggestions');
                            if (popup) {
                                popup.remove();
                            }
                        } catch (error) {
                            console.error('Ошибка при выполнении команды mention:', error);
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

                                    // Добавляем кнопку закрытия для мобильной версии
                                    if (isMobile) {
                                        const closeButton = document.createElement('button');
                                        closeButton.innerHTML = '✕';
                                        closeButton.className = 'absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-full hover:bg-accent-blue/10 transition-colors duration-150';
                                        closeButton.onclick = () => {
                                            popup.remove();
                                            currentMentionPopup.current = null;
                                        };
                                        popup.appendChild(closeButton);
                                    }

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

    // Состояние для отслеживания перетаскивания
    const [isDragging, setIsDragging] = useState(false);

    // Состояние для модального окна загрузки файлов
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Обработка drag & drop файлов
    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files);

        if (files.length === 0) return;

        // Если есть attachableType и attachableId, открываем модальное окно для всех файлов
        if (attachableType && attachableId) {
            setShowFileUploadModal(true);
            // Передаем файлы в модальное окно через состояние
            setSelectedFiles(files);
            return;
        }

        // Fallback для изображений (если нет attachableType/attachableId)
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
    }, [editor, attachableType, attachableId]);

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

    // Обработка загрузки файлов через модальное окно
    const handleFileUploaded = useCallback((files) => {
        if (!editor || !files || files.length === 0) return;

        try {
            // Создаем массив узлов для всех файлов с разделителями
            const contentNodes = [];

            files.forEach((file, index) => {
                // Добавляем файл
                contentNodes.push({
                    type: 'fileAttachment',
                    attrs: {
                        id: file.id,
                        filename: file.original_name,
                        size: file.file_size,
                        mimeType: file.mime_type,
                        url: file.download_url || `/file-upload/${file.id}/download`,
                        description: file.description || ''
                    }
                });

                // Добавляем разделитель между файлами (кроме последнего)
                if (index < files.length - 1) {
                    contentNodes.push({
                        type: 'paragraph',
                        content: []
                    });
                }
            });

            // Вставляем все файлы как один блок контента
            editor.chain().focus().insertContent(contentNodes).run();

        } catch (error) {
            console.error('RichTextEditor: Ошибка при вставке файлов:', error);
        }

        setShowFileUploadModal(false);
        setSelectedFiles([]);
    }, [editor]);

    // Обработка ошибок загрузки файлов
    const handleFileUploadError = useCallback((error) => {
        console.error('Ошибка загрузки файла:', error);
        // Здесь можно добавить уведомление об ошибке
    }, []);

    // Функция для открытия модального окна изображений
    const openImageModal = useCallback((imageUrl) => {
        setCurrentImageUrl(imageUrl);
        setShowImageModal(true);
    }, []);



    // Функция для удаления файла
    const deleteFileAttachment = useCallback(async (fileId) => {
        if (!confirm('Вы уверены, что хотите удалить этот файл? Файл будет удален с сервера.')) {
            return;
        }

        try {
            const response = await fetch(`/file-upload/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                // Удаляем файл из редактора
                if (editor) {
                    editor.commands.deleteSelection();
                }
            } else {
                console.error('Ошибка при удалении файла');
                alert('Ошибка при удалении файла');
            }
        } catch (error) {
            console.error('Ошибка при удалении файла:', error);
            alert('Ошибка при удалении файла');
        }
    }, [editor]);

    // Функция для восстановления файлов из простого текста
    const restoreFileAttachments = useCallback(() => {
        if (!editor) return;

        const { state } = editor;
        let restored = false;

        // Проходим по всем параграфам и ищем файлы для восстановления
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
                    editor.chain()
                        .focus()
                        .deleteRange({ from: pos, to: pos + node.nodeSize })
                        .setFileAttachment({
                            id: 'recovered_' + Date.now(),
                            filename: filename,
                            size: size,
                            mimeType: mimeType,
                            url: '#',
                            description: '',
                        })
                        .run();

                    restored = true;
                    return false; // Останавливаем поиск после первого восстановления
                }
            }
        });

        // Также ищем и восстанавливаем HTML блоки файлов, которые потеряли функциональность
        state.doc.descendants((node, pos) => {
            if (node.type.name === 'doc' || node.type.name === 'paragraph') {
                // Ищем HTML блоки файлов
                const htmlContent = node.type.name === 'doc' ?
                    editor.getHTML() :
                    editor.getHTML().substring(pos, pos + node.nodeSize);

                // Ищем блоки изображений
                const imageBlockMatch = htmlContent.match(/<div[^>]*class="[^"]*file-attachment-image[^"]*"[^>]*>.*?<img[^>]*src="([^"]+)"[^>]*>.*?<span[^>]*class="[^"]*file-attachment-filename[^"]*"[^>]*>([^<]+)<\/span>/s);

                if (imageBlockMatch) {
                    const url = imageBlockMatch[1];
                    const filename = imageBlockMatch[2];

                    // Восстанавливаем изображение как полноценный узел
                    editor.chain()
                        .focus()
                        .deleteRange({ from: pos, to: pos + node.nodeSize })
                        .setFileAttachment({
                            id: 'recovered_' + Date.now(),
                            filename: filename,
                            size: 0, // Размер неизвестен
                            mimeType: 'image/png',
                            url: url,
                            description: '',
                        })
                        .run();

                    restored = true;
                    return false;
                }
            }
        });

        if (restored) {
            console.log('Файлы восстановлены');
        }
    }, [editor]);

    // Добавляем глобальные функции
    useEffect(() => {
        window.openImageModal = openImageModal;
        window.deleteFileAttachment = deleteFileAttachment;

        return () => {
            delete window.openImageModal;
            delete window.deleteFileAttachment;
        };
    }, [openImageModal, deleteFileAttachment]);

    // Автоматически восстанавливаем файлы при загрузке контента
    useEffect(() => {
        if (editor && value) {
            // Небольшая задержка для полной загрузки контента
            const timer = setTimeout(() => {
                restoreFileAttachments();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [editor, value, restoreFileAttachments]);

    if (!editor) {
        return null;
    }

    // Дополнительная проверка готовности редактора
    if (!editor.view || !editor.view.dom || editor.isDestroyed) {
        return (
            <div className={`rounded-lg ${className}`}>
                <div className="flex items-center justify-center p-8 text-text-muted">
                    Загрузка редактора...
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{editorStyles}</style>
            <div className={`rounded-lg ${className}`}>
                {/* Панель инструментов */}
            <div className="flex items-center gap-1 p-2 border-b border-border-color bg-secondary-bg overflow-x-auto rounded-t-lg">
                {/* ИИ кнопка оптимизации - первая кнопка */}
                <AiOptimizeButton editor={editor} />

                {/* Разделитель */}
                <div className="w-px h-6 bg-border-color mx-1"></div>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 transition-colors duration-200 ease-in-out ${
                        editor.isActive('bold') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Жирный"
                >
                    <Bold size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 transition-colors duration-200 ease-in-out ${
                        editor.isActive('italic') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Курсив"
                >
                    <Italic size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 transition-colors duration-200 ease-in-out ${
                        editor.isActive('code') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Код"
                >
                    <Code size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 transition-colors duration-200 ease-in-out ${
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
                    className={`p-2 rounded hover:bg-accent-blue/10 transition-colors duration-200 ease-in-out ${
                        editor.isActive('bulletList') ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
                    }`}
                    title="Маркированный список"
                >
                    <List size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-accent-blue/10 transition-colors duration-200 ease-in-out ${
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
                    className={`p-2 rounded hover:bg-accent-blue/10 transition-colors duration-200 ease-in-out ${
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
                    onClick={() => setShowFileUploadModal(true)}
                    className="p-2 rounded hover:bg-accent-blue/10 text-text-primary"
                    title="Загрузить файл"
                    disabled={!attachableType || !attachableId}
                >
                    <Paperclip size={16} />
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
                <div className={`p-2 border-b border-border-color bg-secondary-bg ${!showImageInput ? 'rounded-b-lg' : ''}`}>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="Введите URL ссылки"
                            className="flex-1 px-3 py-1.5 text-sm border border-border-color rounded-lg bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all duration-200"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addLink();
                                if (e.key === 'Escape') setShowLinkInput(false);
                            }}
                        />
                        <button
                            onClick={addLink}
                            className="px-3 py-1.5 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                        >
                            Добавить
                        </button>
                        <button
                            onClick={() => setShowLinkInput(false)}
                            className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Поле ввода изображения */}
            {showImageInput && (
                <div className="p-2 border-b border-border-color bg-secondary-bg rounded-b-lg">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Введите URL изображения"
                            className="flex-1 px-3 py-1.5 text-sm border border-border-color rounded-lg bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all duration-200"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addImage();
                                if (e.key === 'Escape') setShowImageInput(false);
                            }}
                        />
                        <button
                            onClick={addImage}
                            className="px-3 py-1.5 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                        >
                            Добавить
                        </button>
                        <button
                            onClick={() => setShowImageInput(false)}
                            className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Основная область редактирования */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!isDragging) setIsDragging(true);
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    if (!isDragging) setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsDragging(false);
                    }
                }}
                className={`min-h-[300px] p-4 bg-card-bg transition-colors duration-200 ${
                    !showLinkInput && !showImageInput ? 'rounded-b-lg' : ''
                } ${isDragging ? 'ring-2 ring-accent-blue/20 bg-accent-blue/5' : ''}`}
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

        {/* Модальное окно загрузки файлов */}
        {attachableType && attachableId && (
            <FileUploadModal
                isOpen={showFileUploadModal}
                onClose={() => {
                    setShowFileUploadModal(false);
                    setSelectedFiles([]);
                }}
                onFileUploaded={handleFileUploaded}
                onError={handleFileUploadError}
                attachableType={attachableType}
                attachableId={attachableId}
                initialFiles={selectedFiles}
            />
        )}

        {/* Модальное окно для просмотра изображений */}
        {showImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Просмотр изображения
                        </h3>
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                        <img
                            src={currentImageUrl}
                            alt="Просмотр изображения"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            style={{ maxHeight: 'calc(90vh - 120px)' }}
                        />
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
                        <a
                            href={currentImageUrl}
                            download
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Скачать
                        </a>
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
);
}

// Компонент для отображения списка упоминаний
class MentionList {
    constructor({ props, editor, onExit }) {
        this.props = {
            ...props,
            index: props.index || 0 // Устанавливаем начальный индекс, если он не определен
        };
        this.editor = editor;
        this.element = document.createElement('div');
        this.element.className = 'w-full bg-transparent';
        this.onExit = onExit;
        this.render();
    }

    render() {
        try {
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
                    <div class="px-3 py-2 cursor-pointer flex items-center space-x-3 hover:bg-accent-blue/10 active:bg-accent-blue/20 transition-colors duration-150 ${
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
                        ${index === this.props.index ? '<div class="text-accent-blue ml-2">✓</div>' : ''}
                    </div>
                `).join('')}
            `;

            this.element.addEventListener('click', (e) => {
                const item = e.target.closest('[data-index]');
                if (item) {
                    const index = parseInt(item.dataset.index);
                    const selectedItem = this.props.items[index];
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
                // Проверяем наличие всех необходимых данных
                if (!item.id || !item.name || !item.email) {
                    console.warn('MentionList select - неполные данные пользователя:', item);
                    return;
                }

                // Вызываем команду с полными данными пользователя
                this.props.command({
                    id: item.id,
                    name: item.name,
                    email: item.email,
                    label: item.name
                });

                // Закрываем popup
                if (this.onExit) {
                    this.onExit();
                }
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
