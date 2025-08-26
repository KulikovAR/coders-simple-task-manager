import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const CtaSection = ({ auth, registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    return (
        <section
            ref={sectionRef}
            id="cta"
            className="max-w-7xl mx-auto px-6 py-8"
        >

            {/* Отзывы пользователей */}
            <div className="mt-24 text-center">

                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                        Что говорят?
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Отзывы наших пользователей
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-secondary-bg/70 border border-border-color rounded-2xl p-6 hover:bg-secondary-bg/90 hover:border-accent-blue/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-1 text-accent-yellow mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-text-secondary mb-6">
                            "ИИ-ассистент — неожиданно удобно. Создаю задачи и назначаю их одной командой,
                            экономит кучу времени. Лучший инструмент для управления проектами на русском языке."
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-blue/20 grid place-items-center">
                                <span className="text-accent-blue font-medium">АК</span>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Алексей К.</div>
                                <div className="text-text-secondary text-sm">Продакт-менеджер</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary-bg/70 border border-border-color rounded-2xl p-6 hover:bg-secondary-bg/90 hover:border-accent-blue/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-1 text-accent-yellow mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-text-secondary mb-6">
                            "Наконец-то нормальный таск-менеджер с уведомлениями в Telegram!
                            Тёмная тема очень удобна для длительной работы, а настраиваемые статусы
                            позволили адаптировать систему под наши процессы."
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-green/20 grid place-items-center">
                                <span className="text-accent-green font-medium">МС</span>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Мария С.</div>
                                <div className="text-text-secondary text-sm">Руководитель проектов</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary-bg/70 border border-border-color rounded-2xl p-6 hover:bg-secondary-bg/90 hover:border-accent-blue/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-1 text-accent-yellow mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-text-secondary mb-6">
                            "Перешли на 379ТМ и не жалеем. Интерфейс простой, интуитивно понятный
                            функциональности хватает. Спринты, канбан, комментарии с упоминаниями —
                            всё на месте, плюс отличный ИИ-помощник."
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-purple/20 grid place-items-center">
                                <span className="text-accent-purple font-medium">ДВ</span>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Дмитрий В.</div>
                                <div className="text-text-secondary text-sm">Тимлид разработки</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CtaSection;
