import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function AiAgentIndex({ auth }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

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
                body: JSON.stringify({ message: inputMessage }),
            });

            const result = await response.json();

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
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Произошла ошибка при обработке запроса. Попробуйте еще раз.',
                success: false,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, errorMessage]);
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

    const renderMessage = (message) => {
        const isUser = message.type === 'user';
        
        return (
            <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isUser
                            ? 'bg-accent-blue text-white'
                            : message.success !== false
                            ? 'bg-secondary-bg text-text-primary'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    <div className="text-sm">{message.content}</div>
                    
                    {message.type === 'ai' && message.results && message.results.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-text-muted mb-1">
                                Выполнено команд: {message.commandsExecuted}
                            </div>
                            {message.results.map((result, index) => (
                                <div key={index} className="text-xs">
                                    {result.links && Object.keys(result.links).length > 0 && (
                                        <div className="mt-1">
                                            {Object.entries(result.links).map(([key, url]) => (
                                                <a
                                                    key={key}
                                                    href={url}
                                                    className="text-accent-blue hover:text-accent-green mr-2"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {key === 'project' ? 'Проект' :
                                                     key === 'task' ? 'Задача' :
                                                     key === 'sprint' ? 'Спринт' : key}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="text-xs text-text-muted mt-1">
                        {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
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

            <div className="max-w-4xl mx-auto">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center">
                            <svg className="w-6 h-6 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            ИИ-Ассистент
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
        </AuthenticatedLayout>
    );
} 