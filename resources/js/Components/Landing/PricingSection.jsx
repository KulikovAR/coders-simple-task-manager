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
        }
    ];

    return (
        <section
            ref={sectionRef}
            id="pricing"
            className="max-w-6xl mx-auto px-6 py-32"
        >
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight leading-tight">
                    Тарифные планы
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Выберите оптимальный тариф для вашей команды
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`bg-white border-2 ${plan.highlighted ? 'border-black' : 'border-gray-200'} rounded-3xl p-10 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 relative flex flex-col`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-black px-6 py-2 rounded-full text-sm font-bold !text-white">
                                Популярный выбор
                            </div>
                        )}

                        <h3 className="text-2xl font-bold text-black mb-3">{plan.name}</h3>
                        <div className="flex items-baseline mb-6">
                            <span className="text-5xl font-bold text-black">{plan.price}</span>
                            {plan.priceDescription && (
                                <span className="text-gray-600 ml-3 text-sm">{plan.priceDescription}</span>
                            )}
                        </div>
                        <p className="text-gray-600 mb-8 leading-relaxed">{plan.description}</p>

                        <ul className="space-y-5 flex-grow mb-8">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <svg className="w-6 h-6 text-black mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto">
                            {plan.name === 'Бесплатный' ? (
                                <Link
                                    href={plan.buttonLink}
                                    className="w-full block text-center py-4 px-4 rounded-full font-semibold transition-all duration-300 bg-black hover:bg-gray-800 !text-white"
                                >
                                    <span className="!text-white">{plan.buttonText}</span>
                                </Link>
                            ) : (
                                <a
                                    href={plan.buttonLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full block text-center py-4 px-4 rounded-full font-semibold transition-all duration-300 bg-black hover:bg-gray-800 !text-white"
                                >
                                    <span className="!text-white">{plan.buttonText}</span>
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Эксклюзивный тариф */}
            <div className="mt-20 bg-gray-50 border-2 border-gray-200 rounded-3xl p-10 hover:border-gray-300 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-3">Тариф "Эксклюзив"</h3>
                        <p className="text-gray-600 mb-4 md:mb-0 leading-relaxed">
                            Если вы не нашли тариф, который подходит Вам и Вашей команде, свяжитесь с нашим менеджером.
                            Мы разработаем индивидуальное решение под ваши потребности.
                        </p>
                    </div>
                    <a
                        href="https://t.me/itteam379manager"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap !text-white"
                    >
                        <span className="!text-white">Связаться с менеджером</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
