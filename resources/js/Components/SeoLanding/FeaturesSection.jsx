import React, { useRef, useEffect } from 'react';

const FeaturesSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    // Добавляем стили для анимации
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow-pulse {
                0%, 100% {
                    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.1);
                }
                50% {
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2);
                }
            }

            @keyframes float {
                0%, 100% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-5px);
                }
            }

            @keyframes shimmer {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }

            .feature-highlighted {
                animation: glow-pulse 2s ease-in-out infinite, float 3s ease-in-out infinite;
            }

            .feature-highlighted::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
                background-size: 200% 100%;
                animation: shimmer 3s ease-in-out infinite;
                border-radius: inherit;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Массив функций с иконками и описаниями
    const features = [
        {
            title: 'Актуальные позиции',
            description: 'Получайте актуальные позиции по ключам и доменам в реальном времени',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            color: 'accent-blue',
            isHighlighted: true
        },
        {
            title: 'Отчеты и графики',
            description: 'Создавайте отчеты и графики в один клик для визуализации данных',
            icon: 'M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            color: 'accent-purple',
            isHighlighted: true
        },
        {
            title: 'История и динамика',
            description: 'Храните историю и отслеживайте динамику позиций по всем вашим запросам',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'accent-cyan',
            isHighlighted: true
        },
        {
            title: 'Экономия и скорость',
            description: 'Экономьте деньги и ускоряйте работу без установки парсеров и сложных скриптов',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            color: 'accent-yellow',
            isHighlighted: true
        },
    ];

    // Функция для определения цвета иконки
    const getIconStyles = (color) => {
        const colorMap = {
            'accent-blue': 'text-blue-500 bg-blue-500/10 group-hover:bg-blue-500/20',
            'accent-purple': 'text-purple-500 bg-purple-500/10 group-hover:bg-purple-500/20',
            'accent-green': 'text-green-500 bg-green-500/10 group-hover:bg-green-500/20',
            'accent-cyan': 'text-cyan-500 bg-cyan-500/10 group-hover:bg-cyan-500/20',
            'accent-yellow': 'text-yellow-500 bg-yellow-500/10 group-hover:bg-yellow-500/20',
            'accent-indigo': 'text-indigo-500 bg-indigo-500/10 group-hover:bg-indigo-500/20',
            'accent-red': 'text-red-500 bg-red-500/10 group-hover:bg-red-500/20',
            'accent-emerald': 'text-emerald-500 bg-emerald-500/10 group-hover:bg-emerald-500/20',
            'accent-orange': 'text-orange-500 bg-orange-500/10 group-hover:bg-orange-500/20',
        };
        return colorMap[color] || 'text-blue-500 bg-blue-500/10';
    };

    return (
        <section
            ref={sectionRef}
            id="features"
            className="max-w-7xl mx-auto px-6 py-24 relative"
        >
            {/* Декоративный элемент */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/5 rounded-full blur-[120px] -z-10"></div>

            <div className="text-center mb-16">
                <span className="bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-1.5 rounded-full text-xs font-semibold inline-block mb-4 text-white">НАШЕ РЕШЕНИЕ</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    CRM-система для работы с XML-лимитами — как полноценный сервис для SEO
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
                    Просто в личном кабинете вставляете ваши XML-ключи и управляете запросами — всё онлайн:
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`group relative rounded-2xl border p-6 text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 ${
                            feature.isHighlighted
                                ? 'feature-highlighted border-accent-blue/30 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm hover:border-accent-blue/50 hover:bg-gradient-to-br hover:from-black/70 hover:to-black/50'
                                : 'border-white/5 bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:border-accent-blue/20'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-xl ${getIconStyles(feature.color)} grid place-items-center mb-5 group-hover:scale-110 transition-all duration-300 shadow-sm ${
                            feature.isHighlighted ? 'animate-pulse' : ''
                        }`}>
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                            </svg>
                        </div>
                        <h3 className={`text-lg font-semibold mb-3 group-hover:text-accent-blue transition-colors text-white ${
                            feature.isHighlighted ? 'text-accent-blue' : ''
                        }`}>
                            {feature.title}
                            {feature.isHighlighted && (
                                <span className="ml-2 text-xs bg-accent-blue/20 text-accent-blue px-2 py-1 rounded-full animate-pulse">
                                    NEW
                                </span>
                            )}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Декоративный разделитель */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border-color/30 to-transparent my-24"></div>

        </section>
    );
};

export default FeaturesSection;

