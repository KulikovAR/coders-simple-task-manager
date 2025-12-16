import React, {useEffect, useRef, useState} from 'react';

const ScreenshotsSection = ({registerRef}) => {
    const sectionRef = useRef(null);
    const [activeTab, setActiveTab] = useState('kanban');

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    return (
        <section
            ref={sectionRef}
            id="screenshots"
            className="max-w-7xl mx-auto px-6 relative pb-24 bg-white"
        >
            {/* Контейнер для скриншота и описания */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Скриншот */}
                <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <img
                        src={`images/landing/screen-1.png`}
                        alt={`Скриншот интерфейса`}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <img
                        src={`/images/landing/screen-2.png`}
                        alt={`Скриншот интерфейса`}
                        className="w-full h-auto object-cover"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 py-12 gap-12 items-center">
                {/* Скриншот */}
                <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <img
                        src={`images/landing/screen-3.png`}
                        alt={`Скриншот интерфейса`}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <img
                        src={`images/landing/screen-4.png`}
                        alt={`Скриншот интерфейса`}
                        className="w-full h-auto"
                    />
                </div>
            </div>

        </section>
    );
};

export default ScreenshotsSection;
