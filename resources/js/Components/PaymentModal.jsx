import { useEffect } from 'react';
import { SUBSCRIPTION_PLANS, AI_REQUEST_LIMITS, AI_REQUEST_PERIODS_BY_PLAN } from '@/Constants/SubscriptionPlans';

export default function PaymentModal({ isOpen, onClose }) {
    // Закрытие модалки по Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 !m-0"
            onClick={onClose}
        >
            <div
                className="bg-card-bg border border-border-color rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                        Спасибо за тестирование!
                    </h3>
                    <p className="text-text-secondary text-sm">
                        {window.subscriptionName === SUBSCRIPTION_PLANS.TEAM_AI
                            ? `В вашем тарифе доступно ${AI_REQUEST_LIMITS[SUBSCRIPTION_PLANS.TEAM_AI]} запросов к ИИ-ассистенту в день`
                            : `В вашем тарифе доступно ${AI_REQUEST_LIMITS[SUBSCRIPTION_PLANS.FREE]} бесплатных запросов к ИИ-ассистенту в месяц`}
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-text-primary text-sm leading-relaxed">
                        Чтобы продолжить автоматизировать задачи без ограничений:
                    </p>

                    <div className="space-y-3">
                        <div className="bg-secondary-bg border border-accent-blue/30 rounded-xl p-4 hover:border-accent-blue transition-colors duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-text-primary font-medium block">Тариф "Команда"</span>
                                    <span className="text-text-secondary text-sm">Неограниченно проектов, участников и памяти</span>
                                </div>
                                <span className="text-accent-blue font-bold">199₽/чел</span>
                            </div>
                        </div>

                        <div className="bg-secondary-bg border border-accent-purple/30 rounded-xl p-4 hover:border-accent-purple transition-colors duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-text-primary font-medium block">Тариф "Команда + ИИ"</span>
                                    <span className="text-text-secondary text-sm">Все возможности + 50 запросов к ИИ в день</span>
                                </div>
                                <span className="text-accent-purple font-bold">999₽/чел</span>
                            </div>
                        </div>

                        <div className="bg-secondary-bg border border-border-color rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-text-primary font-medium">Напишите нашему менеджеру</span>
                                <a
                                    href="https://t.me/itteam379manager"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-accent-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-blue/80 transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                    </svg>
                                    Написать в Telegram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}
