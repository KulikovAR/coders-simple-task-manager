/**
 * Утилиты для работы с ИИ в RichTextEditor
 */

/**
 * Извлекает текстовое содержимое из редактора, исключая файлы
 * @param {Object} editor - Экземпляр tiptap редактора
 * @returns {string} - Извлеченный текст
 */
export function extractTextFromEditor(editor) {
    if (!editor) return '';

    // Получаем JSON структуру документа
    const doc = editor.getJSON();
    
    // Рекурсивно извлекаем текст, пропуская файлы
    function extractTextFromNode(node) {
        if (!node) return '';
        
        // Пропускаем узлы файлов
        if (node.type === 'fileAttachment') {
            return '';
        }
        
        let text = '';
        
        // Если у узла есть текстовое содержимое
        if (node.text) {
            text += node.text;
        }
        
        // Если у узла есть дочерние узлы
        if (node.content && Array.isArray(node.content)) {
            for (const child of node.content) {
                text += extractTextFromNode(child);
            }
        }
        
        // Добавляем перенос строки для блочных элементов
        if (node.type === 'paragraph' || node.type === 'heading') {
            text += '\n';
        }
        
        return text;
    }
    
    return extractTextFromNode(doc).trim();
}

/**
 * Заменяет содержимое редактора новым текстом
 * @param {Object} editor - Экземпляр tiptap редактора
 * @param {string} newText - Новый текст для вставки
 */
export function replaceEditorContent(editor, newText) {
    if (!editor) return;
    
    // Очищаем редактор и вставляем новый текст
    editor.commands.setContent(newText);
}

/**
 * Вставляет оптимизированный текст в выбранную область
 * @param {Object} editor - Экземпляр tiptap редактора
 * @param {string} optimizedText - Оптимизированный текст
 */
export function insertOptimizedText(editor, optimizedText) {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    
    // Если есть выделенный текст, заменяем его
    if (from !== to) {
        editor.commands.deleteRange({ from, to });
    }
    
    // Вставляем оптимизированный текст
    editor.commands.insertContent(optimizedText);
}

/**
 * Проверяет, есть ли в редакторе текстовое содержимое для оптимизации
 * @param {Object} editor - Экземпляр tiptap редактора
 * @returns {boolean} - true если есть текст для оптимизации
 */
export function hasTextToOptimize(editor) {
    if (!editor) return false;
    
    const text = extractTextFromEditor(editor);
    return text.length > 10; // Минимум 10 символов для оптимизации
}

/**
 * Получает статистику текста в редакторе
 * @param {Object} editor - Экземпляр tiptap редактора
 * @returns {Object} - Статистика текста
 */
export function getTextStats(editor) {
    if (!editor) return { characters: 0, words: 0, lines: 0 };
    
    const text = extractTextFromEditor(editor);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    return {
        characters: text.length,
        words: words.length,
        lines: lines.length
    };
}

/**
 * Проверяет, есть ли выделенный текст в редакторе
 * @param {Object} editor - Экземпляр tiptap редактора
 * @returns {boolean} - true если есть выделенный текст
 */
export function hasSelectedText(editor) {
    if (!editor) return false;
    
    const { from, to } = editor.state.selection;
    return from !== to && to - from > 0;
}

/**
 * Получает выделенный текст из редактора
 * @param {Object} editor - Экземпляр tiptap редактора
 * @returns {string} - Выделенный текст
 */
export function getSelectedText(editor) {
    if (!editor) return '';
    
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to);
}
