import { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle, AlertCircle, Crown } from 'lucide-react';
import { hasSelectedText, getSelectedText } from './aiUtils';

export default function AiOptimizeButton({ editor, className = '' }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error', 'limit_exceeded', null
    const [hasSelection, setHasSelection] = useState(false);
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);

    // Отслеживаем изменения выделения
    useEffect(() => {
        if (!editor) return;

        const updateSelection = () => {
            setHasSelection(hasSelectedText(editor));
        };

        // Обновляем при изменении выделения
        editor.on('selectionUpdate', updateSelection);
        
        // Инициализируем состояние
        updateSelection();

        return () => {
            editor.off('selectionUpdate', updateSelection);
        };
    }, [editor]);

    const handleOptimize = async () => {
        if (!editor || !hasSelectedText(editor)) {
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            // Извлекаем только выделенный текст
            const selectedText = getSelectedText(editor);

            // Отправляем запрос на оптимизацию
            const response = await fetch('/ai-text-optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify({
                    text: selectedText
                })
            });

            const data = await response.json();

            if (data.success) {
                // Заменяем только выделенный текст на оптимизированный
                const { from, to } = editor.state.selection;
                editor.commands.deleteRange({ from, to });
                editor.commands.insertContent(data.optimized_text);
                setStatus('success');

                // Убираем статус через 3 секунды
                setTimeout(() => setStatus(null), 3000);
            } else {
                setStatus('error');
                
                // Обрабатываем ошибку лимитов ИИ
                if (data.error_type === 'ai_limit_exceeded') {
                    setStatus('limit_exceeded');
                    setSubscriptionInfo(data.subscription_info);
                    console.warn('Исчерпан лимит запросов к ИИ:', data.message);
                } else {
                    setStatus('error');
                    console.error('Ошибка оптимизации:', data.message);
                }
            }
        } catch (error) {
            setStatus('error');
            console.error('Ошибка при запросе к ИИ:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const canOptimize = editor && hasSelection;

    const getButtonContent = () => {
        if (isLoading) {
            return (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Оптимизация...</span>
                </>
            );
        }

        if (status === 'success') {
            return (
                <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Готово!</span>
                </>
            );
        }

        if (status === 'error') {
            return (
                <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Ошибка</span>
                </>
            );
        }

        if (status === 'limit_exceeded') {
            return (
                <>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>Лимит ИИ</span>
                </>
            );
        }

        return (
            <>
                <Sparkles className="w-4 h-4" />
                <span>ИИ</span>
            </>
        );
    };

    return (
        <button
            type="button"
            onClick={handleOptimize}
            disabled={!canOptimize || isLoading}
            className={`
                flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${canOptimize && !isLoading
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }
                ${className}
            `}
            title={
                status === 'limit_exceeded' 
                    ? `Исчерпан лимит ИИ (${subscriptionInfo?.ai_requests_used || 0}/${subscriptionInfo?.ai_requests_limit || 0}). Обновите тариф для продолжения.`
                    : canOptimize
                        ? 'Оптимизировать выделенный текст с помощью ИИ'
                        : 'Выделите текст для оптимизации'
            }
        >
            {getButtonContent()}
        </button>
    );
}
