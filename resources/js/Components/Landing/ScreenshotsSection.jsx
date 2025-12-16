import React, {useEffect, useRef} from 'react';

const ScreenshotsSection = ({registerRef}) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            registerRef(sectionRef.current);
        }
    }, [registerRef]);

    return (
        <section
            ref={sectionRef}
            id="screenshots"
            className="max-w-6xl mx-auto px-6 py-32"
        >
            {/* Контейнер для скриншотов */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                    <img
                        src={`images/landing/screen-1.png`}
                        alt={`Скриншот интерфейса`}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                    <img
                        src={`/images/landing/screen-2.png`}
                        alt={`Скриншот интерфейса`}
                        className="w-full h-auto object-cover"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 py-12 gap-12 items-center">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                    <img
                        src={`images/landing/screen-3.png`}
                        alt={`Скриншот интерфейса`}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="relative rounded-lg overflow-hidden shadow-lg">
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
