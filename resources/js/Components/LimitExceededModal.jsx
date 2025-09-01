import { useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function LimitExceededModal({ isOpen, onClose, limitType, currentLimit, currentPlan }) {
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

    // Определяем заголовок и текст в зависимости от типа лимита
    let title = 'Достигнут лимит тарифа';
    let description = '';
    let limitText = '';

    switch (limitType) {
        case 'projects':
            title = 'Достигнут лимит проектов';
            description = `В вашем тарифе "${currentPlan}" доступно ${currentLimit} проектов.`;
            limitText = 'проектов';
            break;
        case 'members':
            title = 'Достигнут лимит участников';
            description = `В вашем тарифе "${currentPlan}" доступно ${currentLimit} участников на проект.`;
            limitText = 'участников';
            break;
        case 'storage':
            title = 'Достигнут лимит хранилища';
            description = `В вашем тарифе "${currentPlan}" доступно ${currentLimit} ГБ хранилища.`;
            limitText = 'хранилища';
            break;
        case 'ai':
            title = 'Достигнут лимит запросов к ИИ';
            description = `В вашем тарифе "${currentPlan}" доступно ${currentLimit} запросов к ИИ.`;
            limitText = 'запросов к ИИ';
            break;
        default:
            description = `В вашем тарифе "${currentPlan}" достигнут лимит.`;
            break;
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-card-bg border border-border-color rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                        {title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                        {description}
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-text-primary text-sm leading-relaxed">
                        Чтобы получить больше {limitText}, обновите тариф:
                    </p>

                    <div className="space-y-3">
                        <div className="bg-secondary-bg border border-accent-blue/30 rounded-xl p-4 hover:border-accent-blue transition-colors duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-text-primary font-medium block">Тариф "Команда"</span>
                                    <span className="text-text-secondary text-sm">Неограниченное количество проектов и участников</span>
                                </div>
                                <span className="text-accent-blue font-bold">199₽/мес</span>
                            </div>
                        </div>

                        <div className="bg-secondary-bg border border-accent-purple/30 rounded-xl p-4 hover:border-accent-purple transition-colors duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-text-primary font-medium block">Тариф "Команда + ИИ"</span>
                                    <span className="text-text-secondary text-sm">Все возможности + 50 запросов к ИИ в день</span>
                                </div>
                                <span className="text-accent-purple font-bold">399₽/мес</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary-bg border border-border-color rounded-xl p-4 mt-4">
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

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium"
                    >
                        Закрыть
                    </button>
                    <Link
                        href={route('profile.edit')}
                        className="px-6 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors duration-200"
                    >
                        Перейти в профиль
                    </Link>
                </div>
            </div>
        </div>
    );
}
