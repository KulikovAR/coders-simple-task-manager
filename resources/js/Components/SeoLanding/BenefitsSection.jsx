import React, { useRef, useEffect } from 'react';

const BenefitsSection = ({ registerRef }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    return (
        <section
            ref={sectionRef}
            id="benefits"
            className="max-w-6xl mx-auto px-6 py-32"
        >
            {/* Заголовок */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-16 max-w-4xl leading-tight">
                Платить большие деньги за услуги? Нет необходимости!
            </h2>
            
            {/* Текст - простой и понятный */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl leading-relaxed">
                Если у вас уже есть XML-лимиты, значит, у вас есть все для полноценного мониторинга. Но большинство пользуются этим только для ручных проверок или парсинга — а ведь можно автоматизировать и упростить работы. Мы создали решение, которое переведёт ваши лимиты на новый уровень.
            </p>
        </section>
    );
};

export default BenefitsSection;
