import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AiMessageRenderer from '@/Components/AiMessageRenderer';
import PaymentModal from '@/Components/PaymentModal';

export default function AiAgentIndex({ auth, conversations, stats }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [historyConversations, setHistoryConversations] = useState(conversations?.data || []);
    const [historyStats, setHistoryStats] = useState(stats || {});
    const [sessionId, setSessionId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const openPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Автоматическое обновление статистики при загрузке
    useEffect(() => {
        loadConversations();
        loadStats();
    }, []);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Если нет активного диалога, создаем новый
        if (!currentConversation) {
            const newConversation = await createNewConversation();
            if (!newConversation) {
                // Если не удалось создать диалог, прерываем отправку
                return;
            }
        }

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(route('ai-agent.process'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ 
                    message: inputMessage,
                    session_id: sessionId 
                }),
            });

            const result = await response.json();

            // Сохраняем session_id для поддержания контекста
            if (result.session_id) {
                setSessionId(result.session_id);
            }

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: result.message,
                success: result.success,
                results: result.results,
                commandsExecuted: result.commands_executed,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
            
            // Проверяем, не исчерпан ли лимит бесплатных запросов
            if (!result.success && result.message && result.message.includes('Бесплатный лимит в 9 запросов исчерпан')) {
                openPaymentModal();
            }
            
            // Обновляем статистику в реальном времени
            setHistoryStats(prev => ({
                ...prev,
                total_messages: (prev.total_messages || 0) + 2, // +2 для сообщения пользователя и ИИ
                successful_commands: (prev.successful_commands || 0) + (result.commands_executed || 0),
            }));
            
            // Обновляем текущий диалог, если он есть
            if (currentConversation) {
                setCurrentConversation(prev => ({
                    ...prev,
                    messages_count: (prev.messages_count || 0) + 2,
                    updated_at: new Date().toISOString(),
                }));
            }
            
            // Обновляем список диалогов
            loadConversations();
            
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Произошла ошибка при обработке запроса. Попробуйте еще раз.',
                success: false,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, errorMessage]);
            
            // Обновляем статистику даже при ошибке
            setHistoryStats(prev => ({
                ...prev,
                total_messages: (prev.total_messages || 0) + 2,
            }));
            
            if (currentConversation) {
                setCurrentConversation(prev => ({
                    ...prev,
                    messages_count: (prev.messages_count || 0) + 2,
                    updated_at: new Date().toISOString(),
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const loadConversation = async (conversationId) => {
        try {
            const response = await fetch(route('ai-agent.conversation.messages', { conversationId }));
            const result = await response.json();
            
            if (result.success) {
                // Обрабатываем сообщения, добавляя timestamp если его нет
                const processedMessages = result.messages.map(message => ({
                    ...message,
                    timestamp: message.timestamp || message.created_at || new Date().toISOString(),
                }));
                
                setMessages(processedMessages.reverse()); // Переворачиваем для правильного порядка
                setCurrentConversation(result.conversation);
                setShowHistory(false);
                
                // Обновляем статистику активных диалогов
                setHistoryStats(prev => ({
                    ...prev,
                    active_conversations: 1, // Текущий диалог становится активным
                }));
            }
        } catch (error) {
            console.error('Ошибка загрузки диалога:', error);
        }
    };

    const createNewConversation = async () => {
        try {
            const response = await fetch(route('ai-agent.conversations.create'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });
            const result = await response.json();
            
            if (result.success) {
                setMessages([]);
                setCurrentConversation(result.conversation);
                setShowHistory(false);
                
                // Обновляем статистику в реальном времени
                setHistoryStats(prev => ({
                    ...prev,
                    total_conversations: (prev.total_conversations || 0) + 1,
                    active_conversations: 1, // Новый диалог становится активным
                }));
                
                // Добавляем новый диалог в список
                setHistoryConversations(prev => [result.conversation, ...prev]);
                
                return result.conversation;
            }
        } catch (error) {
            console.error('Ошибка создания диалога:', error);
        }
        return null;
    };

    const loadConversations = async () => {
        try {
            const response = await fetch(route('ai-agent.conversations'));
            const result = await response.json();
            
            if (result.success) {
                // Обрабатываем диалоги, добавляя updated_at если его нет
                const processedConversations = result.conversations.map(conversation => ({
                    ...conversation,
                    updated_at: conversation.updated_at || conversation.created_at || new Date().toISOString(),
                }));
                
                setHistoryConversations(processedConversations);
                
                // Обновляем статистику на основе актуальных данных
                const totalMessages = processedConversations.reduce((sum, conv) => sum + (conv.messages_count || 0), 0);
                const activeConversations = processedConversations.filter(conv => conv.is_active).length;
                
                setHistoryStats(prev => ({
                    ...prev,
                    total_conversations: processedConversations.length,
                    total_messages: totalMessages,
                    active_conversations: activeConversations,
                }));
            }
        } catch (error) {
            console.error('Ошибка загрузки диалогов:', error);
        }
    };

    const deleteConversation = async (conversationId) => {
        if (!confirm('Вы уверены, что хотите удалить этот диалог?')) return;
        
        try {
            const response = await fetch(route('ai-agent.conversations.delete', { conversationId }), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });
            const result = await response.json();
            
            if (result.success) {
                // Обновляем статистику в реальном времени
                const deletedConversation = historyConversations.find(c => c.id === conversationId);
                if (deletedConversation) {
                    setHistoryStats(prev => ({
                        ...prev,
                        total_conversations: Math.max(0, (prev.total_conversations || 0) - 1),
                        total_messages: Math.max(0, (prev.total_messages || 0) - (deletedConversation.messages_count || 0)),
                        active_conversations: deletedConversation.is_active ? Math.max(0, (prev.active_conversations || 0) - 1) : (prev.active_conversations || 0),
                    }));
                }
                
                loadConversations();
                if (currentConversation?.id === conversationId) {
                    setMessages([]);
                    setCurrentConversation(null);
                }
            }
        } catch (error) {
            console.error('Ошибка удаления диалога:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(route('ai-agent.stats'));
            const result = await response.json();
            
            if (result.success) {
                setHistoryStats(result.stats);
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    };

    const renderMessage = (message) => {
        const isUser = message.type === 'user';
        
        return (
            <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        isUser
                            ? 'bg-accent-blue text-white'
                            : message.success !== false
                            ? 'bg-secondary-bg text-text-primary shadow-sm'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {isUser ? (
                        // Простое отображение для сообщений пользователя
                        <div className="text-sm">{message.content}</div>
                    ) : (
                        // Красивое отображение для сообщений ИИ
                        <AiMessageRenderer
                            content={message.content}
                            results={message.results}
                            commandsExecuted={message.commandsExecuted}
                            timestamp={message.timestamp}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-text-primary leading-tight">ИИ-Ассистент</h2>}
        >
            <Head title="ИИ-Ассистент" />

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Боковая панель с историей */}
                    <div className="lg:col-span-1">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title flex items-center justify-between">
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        История
                                    </span>
                                    <button
                                        onClick={createNewConversation}
                                        className="text-accent-blue hover:text-accent-green"
                                        title="Новый диалог"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </h3>
                            </div>
                            
                            <div className="p-4">
                                {/* Статистика */}
                                <div className="mb-4 p-3 bg-secondary-bg rounded-lg">
                                    <div className="text-sm text-text-muted mb-2">Статистика</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <div className="font-medium text-text-primary">{historyStats.total_conversations || 0}</div>
                                            <div className="text-text-muted">Диалогов</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-text-primary">{historyStats.total_messages || 0}</div>
                                            <div className="text-text-muted">Сообщений</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-text-primary">{historyStats.successful_commands || 0}</div>
                                            <div className="text-text-muted">Команд</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-text-primary">{historyStats.active_conversations || 0}</div>
                                            <div className="text-text-muted">Активных</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Список диалогов */}
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {historyConversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                                currentConversation?.id === conversation.id
                                                    ? 'bg-accent-blue text-white'
                                                    : 'bg-secondary-bg hover:bg-accent-blue/10'
                                            }`}
                                            onClick={() => loadConversation(conversation.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm font-medium truncate ${
                                                        currentConversation?.id === conversation.id
                                                            ? 'text-white'
                                                            : 'text-text-primary'
                                                    }`}>
                                                        {conversation.title}
                                                    </div>
                                                    <div className={`text-xs mt-1 ${
                                                        currentConversation?.id === conversation.id
                                                            ? 'text-blue-100'
                                                            : 'text-text-muted'
                                                    }`}>
                                                        {conversation.messages_count} сообщений
                                                    </div>
                                                    <div className={`text-xs ${
                                                        currentConversation?.id === conversation.id
                                                            ? 'text-blue-100'
                                                            : 'text-text-muted'
                                                    }`}>
                                                        {conversation.updated_at ? new Date(conversation.updated_at).toLocaleDateString('ru-RU') : 'Сегодня'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteConversation(conversation.id);
                                                    }}
                                                    className={`ml-2 p-1 rounded hover:bg-red-500/20 ${
                                                        currentConversation?.id === conversation.id
                                                            ? 'text-red-200 hover:text-red-100'
                                                            : 'text-text-muted hover:text-red-500'
                                                    }`}
                                                    title="Удалить диалог"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Основной чат */}
                    <div className="lg:col-span-3">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    {currentConversation ? currentConversation.title : 'ИИ-Ассистент'}
                                </h3>
                                <p className="text-sm text-text-secondary">
                                    Задавайте вопросы на естественном языке, и я помогу вам управлять задачами и проектами
                                </p>
                            </div>

                            <div className="flex flex-col h-96">
                                {/* Сообщения */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-text-muted py-8">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-lg font-medium mb-2">Начните разговор</p>
                                            <p className="text-sm">
                                                Попробуйте: "Создай новый проект", "Покажи мои задачи", "Создай задачу в проекте"
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map(renderMessage)
                                    )}
                                    
                                    {isLoading && (
                                        <div className="flex justify-start mb-4">
                                            <div className="bg-secondary-bg text-text-primary max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                    <span className="text-sm">Обрабатываю запрос...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Поле ввода */}
                                <div className="border-t border-border p-4">
                                    <div className="flex space-x-2">
                                        <textarea
                                            style={{
                                                color: 'black',
                                            }}
                                            id='inputMessage'
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Введите ваш запрос..."
                                            className="flex-1 resize-none border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                                            rows="2"
                                            disabled={isLoading}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!inputMessage.trim() || isLoading}
                                            className="btn btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Быстрые команды */}
                        <div className="mt-6">
                            <h4 className="text-lg font-medium text-text-primary mb-3">Быстрые команды</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[
                                    'Создай новый проект',
                                    'Покажи мои задачи',
                                    'Создай задачу в проекте',
                                    'Покажи статистику',
                                    'Найди проект по названию',
                                    'Обнови статус задачи',
                                ].map((command, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInputMessage(command)}
                                        className="text-left p-3 bg-secondary-bg rounded-lg hover:bg-accent-blue/10 transition-colors text-sm text-text-secondary hover:text-text-primary"
                                    >
                                        {command}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модалка оплаты подписки */}
            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={closePaymentModal} 
            />
        </AuthenticatedLayout>
    );
} 