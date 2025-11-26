import { useState, useRef, useEffect } from 'react';
import { useSeoRecognition } from '@/hooks/useSeoRecognition';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import RecognitionConfirmationModal from './RecognitionConfirmationModal';
import Tooltip from '@/Components/SeoStats/Tooltip';

export default function TrackPositionsButton({ siteId, size = 'default', initialData = null }) {
    const { recognitionStatus, startRecognition } = useSeoRecognition(siteId, initialData);
    const [isStarting, setIsStarting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const tooltipRef = useRef(null);

    useEffect(() => {
        tooltipRef.current = new Tooltip();
        return () => tooltipRef.current?.hide();
    }, []);

    const showHighloadWarning = () => {
        if (recognitionStatus.xmlServer === 'stock' && recognitionStatus.stockHighload) {
            return 'Сервис XMLStock временно нагружен';
        }
        if (recognitionStatus.xmlServer === 'river' && recognitionStatus.riverHighload) {
            return 'Сервис XMLRiver временно нагружен';
        }
        return null;
    };

    const highloadMessage = showHighloadWarning();

    const handleStartRecognition = async () => {
        setIsStarting(true);
        try {
            const result = await startRecognition();
            if (!result.success) {
                alert(result.message || result.error || 'Ошибка запуска распознавания');
            }
        } catch (error) {
            alert('Ошибка запуска распознавания');
        } finally {
            setIsStarting(false);
        }
    };

    const getButtonClasses = () => {
        const baseClasses = 'rounded-lg transition-colors flex items-center gap-2';

        if (size === 'small') {
            return `${baseClasses} px-3 py-1.5 text-xs font-medium`;
        }

        return `${baseClasses} px-4 py-2 text-sm font-medium`;
    };

    const getIconSize = () => {
        return size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
    };

    if (recognitionStatus.status === 'pending' || recognitionStatus.status === 'processing' || isStarting) {
        const progress = recognitionStatus.progressPercentage || 0;

        return (
            <button
                disabled
                className={`${getButtonClasses()} bg-gray-400 text-white cursor-not-allowed relative`}
                title={`${progress}%`}
            >
                <div className={`${getIconSize()} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
                {`${progress}%`}

                {highloadMessage && (
                    <ExclamationTriangleIcon
                        className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 cursor-pointer"
                        onMouseEnter={(e) => tooltipRef.current.show({
                            x: e.clientX,
                            y: e.clientY,
                            url: highloadMessage
                        })}
                        onMouseLeave={() => tooltipRef.current.hide()}
                    />
                )}
            </button>
        );
    }

    if (recognitionStatus.status === 'failed') {
        return (
            <button
                onClick={() => setShowModal(true)}
                className={`${getButtonClasses()} bg-red-500 text-white hover:bg-red-600 relative`}
                title="Повторить снятие позиций"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Повторить

                {highloadMessage && (
                    <ExclamationTriangleIcon
                        className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 cursor-pointer"
                        onMouseEnter={(e) => tooltipRef.current.show({
                            x: e.clientX,
                            y: e.clientY,
                            url: highloadMessage
                        })}
                        onMouseLeave={() => tooltipRef.current.hide()}
                    />
                )}
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`${getButtonClasses()} bg-accent-green text-white hover:bg-accent-green/90 relative`}
                title="Снять позиции"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Снять позиции

                {highloadMessage && (
                    <ExclamationTriangleIcon
                        className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 cursor-pointer"
                        onMouseEnter={(e) => tooltipRef.current.show({
                            x: e.clientX,
                            y: e.clientY,
                            url: highloadMessage
                        })}
                        onMouseLeave={() => tooltipRef.current.hide()}
                    />
                )}
            </button>

            <RecognitionConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleStartRecognition}
                siteId={siteId}
                type="recognition"
            />
        </>
    );
}
