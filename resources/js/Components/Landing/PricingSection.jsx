import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const PricingSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    const plans = [
        {
            name: 'Бесплатный',
            price: '0 ₽',
            description: 'Для небольших команд и личных проектов',
            features: [
                '10 проектов',
                '5 участников',
                '5 ГБ памяти',
                '5 запросов к ИИ-ассистенту в месяц',
                'Базовая поддержка'
            ],
            buttonText: 'Начать бесплатно',
            buttonLink: route('register'),
            highlighted: false,
            bgClass: 'bg-secondary-bg/70'
        },
        {
            name: 'Команда',
            price: '199 ₽',
            priceDescription: 'за человека в месяц',
            description: 'Для растущих команд и бизнеса',
            features: [
                'Неограниченное количество проектов',
                'Неограниченное количество участников',
                'Неограниченный объем памяти',
                '5 запросов к ИИ-ассистенту в месяц',
                'Приоритетная поддержка'
            ],
            buttonText: 'Связаться с менеджером',
            buttonLink: 'https://t.me/itteam379manager',
            highlighted: false,
            bgClass: 'bg-secondary-bg/70'
        },
        {
            name: 'Команда + ИИ',
                            price: '999 ₽',
            priceDescription: 'за человека в месяц',
            description: 'Максимальная продуктивность с ИИ',
            features: [
                'Неограниченное количество проектов',
                'Неограниченное количество участников',
                'Неограниченный объем памяти',
                '50 запросов к ИИ в день (GPT нового поколения)',
                'Приоритетная поддержка 24/7'
            ],
            buttonText: 'Связаться с менеджером',
            buttonLink: 'https://t.me/itteam379manager',
            highlighted: true,
            bgClass: 'bg-gradient-to-b from-accent-blue/20 to-accent-purple/20'
        }
    ];

    return (
        <section
            ref={sectionRef}
            id="pricing"
            className="max-w-7xl mx-auto px-6 py-24"
        >
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                    Тарифные планы
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Выберите оптимальный тариф для вашей команды
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <div 
                        key={index} 
                        className={`${plan.bgClass} border ${plan.highlighted ? 'border-accent-blue/30' : 'border-border-color'} rounded-2xl p-8 hover:border-accent-blue/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg relative flex flex-col`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-accent-blue to-accent-purple text-white px-4 py-1 rounded-full text-sm font-medium">
                                Популярный выбор
                            </div>
                        )}
                        
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline mb-6">
                            <span className="text-4xl font-bold text-white">{plan.price}</span>
                            {plan.priceDescription && (
                                <span className="text-text-secondary ml-2">{plan.priceDescription}</span>
                            )}
                        </div>
                        <p className="text-text-secondary mb-6">{plan.description}</p>
                        
                        <ul className="space-y-4 flex-grow">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <svg className="w-5 h-5 text-accent-green mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-text-primary">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="mt-6">
                            {plan.name === 'Бесплатный' ? (
                                <Link
                                    href={plan.buttonLink}
                                    className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                                        plan.highlighted
                                            ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:shadow-lg hover:shadow-accent-blue/20'
                                            : 'bg-secondary-bg border border-border-color hover:border-accent-blue/30 text-white'
                                    }`}
                                >
                                    {plan.buttonText}
                                </Link>
                            ) : (
                                <a
                                    href={plan.buttonLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                                        plan.highlighted
                                            ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:shadow-lg hover:shadow-accent-blue/20'
                                            : 'bg-secondary-bg border border-border-color hover:border-accent-blue/30 text-white'
                                    }`}
                                >
                                    {plan.buttonText}
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Эксклюзивный тариф */}
            <div className="mt-16 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-border-color rounded-2xl p-8 hover:border-accent-blue/20 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Тариф "Эксклюзив"</h3>
                        <p className="text-text-secondary mb-4 md:mb-0">
                            Если вы не нашли тариф, который подходит Вам и Вашей команде, свяжитесь с нашим менеджером.
                            Мы разработаем индивидуальное решение под ваши потребности.
                        </p>
                    </div>
                    <a
                        href="https://t.me/itteam379manager"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300 whitespace-nowrap"
                    >
                        Связаться с менеджером
                    </a>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
