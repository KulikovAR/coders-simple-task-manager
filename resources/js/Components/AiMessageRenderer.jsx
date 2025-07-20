import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiMessageRenderer = ({ content, results, commandsExecuted, timestamp }) => {
    // Функция для обработки ссылок в тексте
    const processLinks = (text) => {
        // Заменяем markdown ссылки на кликабельные
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            return `<a href="${url}" class="text-accent-blue hover:text-accent-green underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
        });
    };

    // Функция для обработки жирного текста
    const processBold = (text) => {
        return text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    };

    // Функция для обработки курсива
    const processItalic = (text) => {
        return text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    };

    // Функция для обработки списков
    const processLists = (text) => {
        // Обрабатываем нумерованные списки
        text = text.replace(/^(\d+\.\s+)(.+)$/gm, '<div class="flex items-start mb-2"><span class="font-semibold mr-2 text-accent-blue">$1</span><span>$2</span></div>');
        
        // Обрабатываем маркированные списки
        text = text.replace(/^[-*]\s+(.+)$/gm, '<div class="flex items-start mb-2"><span class="mr-2 text-accent-blue">•</span><span>$1</span></div>');
        
        return text;
    };

    // Функция для обработки заголовков
    const processHeaders = (text) => {
        // Обрабатываем заголовки разных уровней
        text = text.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-semibold text-accent-blue mb-2">$1</h3>');
        text = text.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold text-accent-blue mb-3">$1</h2>');
        text = text.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold text-accent-blue mb-4">$1</h1>');
        
        return text;
    };

    // Функция для обработки блоков кода
    const processCodeBlocks = (text) => {
        return text.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3">$1</pre>');
    };

    // Функция для обработки инлайн кода
    const processInlineCode = (text) => {
        return text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    };

    // Функция для обработки разделителей
    const processSeparators = (text) => {
        return text.replace(/^---$/gm, '<hr class="my-4 border-gray-300">');
    };

    // Основная функция обработки текста
    const processText = (text) => {
        if (!text) return '';
        
        let processedText = text;
        
        // Применяем обработчики в правильном порядке
        processedText = processCodeBlocks(processedText);
        processedText = processHeaders(processedText);
        processedText = processSeparators(processedText);
        processedText = processLists(processedText);
        processedText = processBold(processedText);
        processedText = processItalic(processedText);
        processedText = processInlineCode(processedText);
        processedText = processLinks(processedText);

        
        return processedText;
    };

    return (
        <div className="ai-message">
            {/* Основной контент */}
            <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: processText(content) }}
            />
            
            {/* Дополнительная информация о выполненных командах */}
            {results && results.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-text-muted mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Выполнено команд: {commandsExecuted}
                    </div>
                    
                    {/* Результаты команд */}
                    {results.map((result, index) => (
                        <div key={index} className="text-xs">
                            {result.links && Object.keys(result.links).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {Object.entries(result.links).map(([key, url]) => (
                                        <a
                                            key={key}
                                            href={url}
                                            className="inline-flex items-center px-2 py-1 bg-accent-blue text-white text-xs rounded hover:bg-accent-green transition-colors"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            {key === 'project' ? 'Проект' :
                                             key === 'task' ? 'Задача' :
                                             key === 'sprint' ? 'Спринт' :
                                             key === 'project_board' ? 'Доска' :
                                             key === 'tasks_list' ? 'Список задач' :
                                             key === 'tasks' ? 'Задачи' :
                                             key === 'projects' ? 'Проекты' : key}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Время сообщения */}
            <div className="text-xs text-text-muted mt-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timestamp ? new Date(timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                }) : new Date().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </div>
        </div>
    );
};

export default AiMessageRenderer; 