import React from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogoSeo';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    // Навигационные ссылки
    const navLinks = [
        { title: 'Возможности', href: '#features' },
        { title: 'Старт', href: '#ai-assistant' },
        { title: 'Преимущества', href: '#benefits' },
    ];

    // Ссылки на документацию
    const docLinks = [
        { title: 'API документация', href: route('api-docs') },
        { title: 'Руководство пользователя', href: '#' },
        { title: 'Интеграции', href: '#' },
        { title: 'Обновления', href: '#' },
    ];

    // Ссылки на контакты
    const contactLinks = [
        { title: 'Telegram поддержка', href: 'https://t.me/itteam379manager', external: true },
        { title: 'Email', href: 'mailto:info@379tm.ru', external: true },
    ];

    // Ссылки на правовую информацию
    const legalLinks = [
        { title: 'Условия использования', href: '/agreement.pdf' },
        { title: 'Политика конфиденциальности', href: '/policy.pdf' },
    ];

    return (
        <>
            <footer className="bg-[#131313] border-t border-border-color pt-16 pb-8 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Основная часть футера */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                        {/* Информация о компании */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <ApplicationLogo className="h-8 w-auto" />
                            </div>
                            <p className="text-gray-300 mb-6 max-w-md">
                                CRM-система для работы с XML-лимитами — как полноценный сервис для SEO
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://t.me/itteam379manager"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-secondary-bg border border-border-color grid place-items-center text-text-secondary hover:text-accent-blue hover:border-accent-blue transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.394-1.362 5.839-.168.606-.504 1.547-.84 1.547-.336 0-.576-.468-.816-.858-.456-.738-1.152-1.932-1.152-1.932l-2.196 1.482c0 .96-.96.576-.96.576s-.348.264-.84-.036c-.492-.3-1.092-.684-1.752-1.116-1.02-.672-1.92-1.584-2.544-2.4-.624-.816-1.698-2.472-1.698-2.472s-.168-.264.12-.408c.288-.144.936-.468.936-.468s3.312-2.988 3.456-3.336c.012-.03.024-.072-.012-.108-.036-.036-.108-.048-.168-.03-.084.024-1.476.936-4.212 2.688-.396.264-.756.396-1.092.384-.36-.012-1.056-.204-1.572-.372-.636-.204-1.14-.312-1.092-.66.024-.18.264-.36.72-.54 2.82-1.236 4.704-2.052 5.64-2.448 2.688-1.14 3.252-1.344 3.612-1.344.084 0 .264.024.384.12.096.072.12.168.132.24.012.06.024.24.024.24s-.036 1.44-.036 1.968c0 .144-.012.312-.012.492 0 .42-.024.888-.048 1.32-.036.72-.084 1.5-.084 1.5s-.036.192.144.252c.12.036.216-.012.3-.06.252-.144 1.572-1.008 2.256-1.476.684-.468 1.368-1.056 1.368-1.056s.156-.084.252-.06c.252.06.576.216.576.216l2.136.936c.084.036.144.06.216.096.252.108.312.216.336.3.012.096-.024.228-.168.348z" />
                                    </svg>
                                </a>
                                <a
                                    href="mailto:support@379tm.com"
                                    className="w-10 h-10 rounded-full bg-secondary-bg border border-border-color grid place-items-center text-text-secondary hover:text-accent-blue hover:border-accent-blue transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Навигация */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-white">
                                Навигация
                            </h3>
                            <ul className="space-y-3">
                                {navLinks.map((link, index) => (
                                    <li key={index}>
                                        {link.href.startsWith('#') ? (
                                            <a
                                                href={link.href}
                                                className="text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                {link.title}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                {link.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Контакты */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-white">
                                Контакты
                            </h3>
                            <ul className="space-y-3">
                                {contactLinks.map((link, index) => (
                                    <li key={index}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                {link.title}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                {link.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Нижняя часть футера */}
                    <div className="border-t border-border-color pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 text-sm">
                            © {currentYear} 379ТМ. Все права защищены.
                        </div>

                        <div className="flex flex-wrap gap-6">
                            {legalLinks.map((link, index) => (
                                <a
                                    target={"_blank"}
                                    key={index}
                                    href={link.href}
                                    className="text-text-secondary hover:text-text-primary transition-colors text-sm"
                                >
                                    {link.title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Плашка "Разработано компанией" */}
            <div className="bg-[#78DDBB] h-8 w-full flex items-center justify-center">
                <div className="text-black text-sm font-medium">
                    Разработано компанией{' '}
                    <a
                        href="https://379team.ru/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-gray-800 transition-colors font-bold"
                    >
                        379team
                    </a>
                </div>
            </div>
        </>
    );
};

export default Footer;

